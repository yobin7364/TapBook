import Service from '../models/Service.module.js'
import { validateService } from '../validator/service.validator.js'
import Review from '../models/Review.module.js'
import Appointment from '../models/Appointment.module.js'
import { validateReview } from '../validator/review.validator.js'
export const publicListServices = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, minRating, start, end } = req.query
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 6
    const skip = (page - 1) * limit

const now = new Date()
const isMember =
  !!req.user?.membership?.expiryDate &&
  new Date(req.user.membership.expiryDate) > now &&
  !req.user.membership.cancelled
const maxAdvanceDays = isMember ? 14 : 0
const latestAllowed = new Date(now.getTime() + maxAdvanceDays * 86400_000)

    if (end) {
      const requestedEnd = new Date(end)
      if (requestedEnd > latestAllowed) {
        return res.status(400).json({
          success: false,
          error: isMember
            ? 'Members can book up to two weeks in advance.'
            : 'You must book for today only. Subscribe for advance booking.',
        })
      }
    }
    const serviceMatch = {}
    if (q) serviceMatch.title = { $regex: q, $options: 'i' }
    if (category) serviceMatch.category = category
    if (minPrice)
      serviceMatch.price = { ...serviceMatch.price, $gte: +minPrice }
    if (maxPrice)
      serviceMatch.price = { ...serviceMatch.price, $lte: +maxPrice }

    const pipeline = [
      { $match: serviceMatch },
      {
        $lookup: {
          from: 'users',
          localField: 'admin',
          foreignField: '_id',
          as: 'admin',
        },
      },
      { $unwind: '$admin' },
      {
        $lookup: {
          from: 'reviews',
          let: { svcId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$service', '$$svcId'] } } },
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
              },
            },
          ],
          as: 'stats',
        },
      },
      {
        $addFields: {
          avgRating: {
            $ifNull: [{ $arrayElemAt: ['$stats.avgRating', 0] }, 0],
          },
          reviewCount: {
            $ifNull: [{ $arrayElemAt: ['$stats.reviewCount', 0] }, 0],
          },
        },
      },
      ...(minRating ? [{ $match: { avgRating: { $gte: +minRating } } }] : []),
    ]

    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      pipeline.push(
        {
          $lookup: {
            from: 'users',
            localField: 'admin._id',
            foreignField: '_id',
            as: 'adminDoc',
          },
        },
        { $unwind: '$adminDoc' },
        {
          $match: {
            'adminDoc.availableTimeSlots': {
              $elemMatch: {
                start: { $lt: endDate },
                end: { $gt: startDate },
              },
            },
          },
        }
      )
    }

    pipeline.push({
      $project: {
        id: '$_id',
        category: 1,
        price: 1,
        duration: 1,
        address: 1,
        businessHours: 1,
        admin: {
          id: '$admin._id',
          name: '$admin.name',
          email: '$admin.email',
        },
        avgRating: 1,
        reviewCount: 1,
      },
    })

    // PAGINATION with $facet: services (paged), total count
    pipeline.push({
      $facet: {
        results: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    })

    const data = await Service.aggregate(pipeline)
    const services = data[0].results
    const total = data[0].totalCount[0]?.count || 0

    return res.json({
      success: true,
      services,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (err) {
    console.error('Public list services error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   POST /api/admin/services
// @desc    Create a new service (admin only)
// @access  Private
export const createService = async (req, res) => {
  const { errors, isValid } = validateService(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  // New: enforce only one service per admin
  const existing = await Service.findOne({ admin: req.user.id })
  if (existing) {
    return res
      .status(400)
      .json({ success: false, error: 'Admin already has a service' })
  }

  try {
    const service = new Service({
      admin: req.user.id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      duration: req.body.duration,
      address: req.body.address, // NEW
      businessHours: req.body.businessHours, // NEW
    })
    await service.save()
    return res.status(201).json({ success: true, service })
  } catch (err) {
    console.error('Service creation error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params
    const service = await Service.findById(
      id,
      ' category duration address businessHours admin'
    )
      .populate('admin', 'name email')
      .lean()

    if (!service) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }

    // compute stats
    const stats = await Review.aggregate([
      { $match: { service: service._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ])

    const avgRating = stats[0]?.avgRating ?? 0
    const reviewCount = stats[0]?.reviewCount ?? 0

    // reshape and return
    const payload = {
      id: service._id.toString(),
      price: service.price,
      description: service.description,
      category: service.category,
      duration: service.duration,
      address: service.address,
      businessHours: service.businessHours,
    admin: {
      id:    service.admin._id.toString(),
      name:  service.admin.name,
      email: service.admin.email
    },
    avgRating,
    reviewCount
  }

    return res.json({ success: true, service: payload })
  } catch (err) {
    console.error('getServiceById error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   GET /api/admin/services
// @desc    List all services with rating info (admin view)
// @access  Private (admin)
export const listServices = async (req, res) => {
  try {
    const svc = await Service.findOne({ admin: req.user.id }).populate(
      'admin',
      'name email'
    )
    if (!svc) {
      return res.json({ success: true, services: [] })
    }
    const stats = await Review.aggregate([
      { $match: { reviewee: svc.admin._id } },
      {
        $group: {
          _id: '$reviewee',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ])
    const { avgRating = 0, reviewCount = 0 } = stats[0] || {}
    return res.json({
      success: true,
      services: [
        {
          id: svc._id,
          title: svc.title,
          description: svc.description,
          category: svc.category,
          price: svc.price,
          duration: svc.duration,
          address: svc.address,
          businessHours: svc.businessHours,
          admin: svc.admin,
          avgRating,
          reviewCount,
        },
      ],
    })

  } catch (err) {
    console.error('List services error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
// @route   GET /api/services/categories
// @desc    Get a list of all distinct service categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    // uses Mongo’s distinct to pull every unique category string
    const categories = await Service.distinct('category')
    return res.json({ success: true, categories })
  } catch (err) {
    console.error('Get categories error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   PUT /api/admin/services/:id
// @desc    Update a service (admin only)
// @access  Private
export const updateService = async (req, res) => {
  const { errors, isValid } = validateService(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  try {
    const updateFields = {
      ...req.body,
    }
    // Only allow admin to update their own service
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, admin: req.user.id },
      updateFields,
      { new: true }
    )
    if (!service) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }
    return res.json({ success: true, service })
  } catch (err) {
    console.error('Update service error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   DELETE /api/admin/services/:id
// @desc    Delete a service (admin only)
// @access  Private
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      admin: req.user.id,
    })
    if (!service) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }
    return res.json({ success: true, message: 'Service deleted' })
  } catch (err) {
    console.error('Delete service error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   POST /api/admin/reviews
// @desc    Submit a review of a customer (admin only)
// @access  Private (admin)
export const createCustomerReview = async (req, res) => {
  const { errors, isValid } = validateReview(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  const { appointment, rating, comment } = req.body
  try {
    const appt = await Appointment.findById(appointment)
    if (!appt) {
      return res
        .status(404)
        .json({ success: false, error: 'Appointment not found' })
    }
    const svc = await Service.findById(appt.service)
    if (!svc || svc.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          error: 'Not authorized to review this customer',
        })
    }
    if (!['confirmed', 'cancelled'].includes(appt.status)) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Can only review completed or cancelled appointments',
        })
    }
    if (await Review.findOne({ appointment })) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Review already exists for this appointment',
        })
    }
    const review = new Review({
      appointment,
      reviewer: req.user.id,
      reviewee: appt.customer,
      service: appt.service,
      rating,
      comment,
    })
    await review.save()
    return res.status(201).json({ success: true, review })
  } catch (err) {
    console.error('Create customer review error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
