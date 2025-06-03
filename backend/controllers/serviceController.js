import Service from '../models/Service.module.js'
import { validateService } from '../validator/service.validator.js'
import Review from '../models/Review.module.js'
import Appointment from '../models/Appointment.module.js'
import { validateReview } from '../validator/review.validator.js'
import mongoose from 'mongoose'
export const publicListServices = async (req, res) => {
  try {
    const { serviceName, category, minPrice, maxPrice, minRating, start, end } = req.query
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
    if (serviceName) serviceMatch.serviceName = { $regex: serviceName, $options: 'i' }
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
        serviceName,
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
      serviceName: req.body.serviceName,
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

export const getServices = async (req, res) => {
  const {
    search,
    category,
    date,
    startTime,
    endTime,
    minRating,
    sortBy     = 'serviceName',
    sortOrder  = 'asc',
    page       = 1,
    limit      = 10
  } = req.query

  const match = {}

  // full‐text search across serviceName, category, and provider name
  if (search) {
    const regex = new RegExp(search, 'i')
    match.$or = [
      { serviceName:    regex },     // ← use serviceName
      { category:       regex },
      { 'adminDoc.name': regex }
    ]
  }

  // explicit category filter
  if (category) {
    match.category = category
  }

  // date + time window (with full‐day defaults)
  if (date) {
    const st = startTime || '00:00'
    const et = endTime   || '23:59'
    const slotStart = new Date(`${date}T${st}Z`)
    const slotEnd   = new Date(`${date}T${et}Z`)
    match.availableTimeSlots = {
      $elemMatch: {
        start: { $lte: slotStart },
        end:   { $gte: slotEnd }
      }
    }
  }

  const skip = (Number(page) - 1) * Number(limit)

  const pipeline = [
    // bring in admin for provider‐name search
    {
      $lookup: {
        from: 'users',
        localField: 'admin',
        foreignField: '_id',
        as: 'adminDoc'
      }
    },
    { $unwind: '$adminDoc' },

    // apply our search/category/availability filters
    { $match: match },

    // join reviews to calculate avgRating & count
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'service',
        as: 'reviews'
      }
    },
    {
      $addFields: {
        avgRating:  { $avg: '$reviews.rating' },
        reviewCount:{ $size: '$reviews' }
      }
    },

    // filter by minimum rating
    ...(minRating
      ? [{ $match: { avgRating: { $gte: Number(minRating) } } }]
      : []),

    // sort, paginate
    { $sort:  { [sortBy]: sortOrder === 'desc' ? -1 : 1, _id: 1 } },
    { $skip:  skip },
    { $limit: Number(limit) },

    // finally, project only the fields your frontend expects
    {
      $project: {
        _id:            1,
        admin: {
          id:    '$adminDoc._id',
          name:  '$adminDoc.name',
          email: '$adminDoc.email'
        },
        serviceName:    1,          // now included!
        category:       1,
        price:          1,
        duration:       1,
        address:        1,
        businessHours:  1,
        avgRating:      1,
        reviewCount:    1,
        availableTimeSlots: 1
      }
    }
  ]

  try {
    const services = await Service.aggregate(pipeline)
    const total    = await Service.countDocuments(match)
    return res.json({
      success: true,
      services,
      pagination: {
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    })
  } catch (err) {
    console.error('Get services error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   GET /api/services/:id
// @desc    Get one service by ID (public)
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const svc = await Service.findById(req.params.id)
      .select('serviceName category duration address businessHours admin')
      .populate('admin', 'name email')
      .lean()

    if (!svc) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }

    // Notice the `new` here:
    const stats = await Review.aggregate([
      {
        $match: {
          service: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ])

    const avgRating = stats[0]?.avgRating ?? 0
    const reviewCount = stats[0]?.count ?? 0

    return res.json({
      success: true,
      service: {
        id: svc._id.toString(),
        serviceName: svc.serviceName,
        category: svc.category,
        duration: svc.duration,
        address: svc.address,
        businessHours: svc.businessHours,
        admin: {
          id: svc.admin._id.toString(),
          name: svc.admin.name,
          email: svc.admin.email,
        },
        avgRating,
        reviewCount,
      },
    })
  } catch (err) {
    console.error('Get service by ID error:', err)
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
          serviceName: svc.serviceName,
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
  // 1) Validate incoming payload (now including `title`)
  const { errors, isValid } = validateService(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  // 2) Explicitly pull in each allowed field
  const {
    serviceName,
    category,
    price,
    duration,
    address,
    businessHours
  } = req.body

  try {
    // 3) Build an object with only the fields you want to update
    const updateFields = {
      serviceName,
      category,
      price,
      duration,
      address,
      businessHours
    }

    // 4) Perform the update (only if admin owns this service)
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

    // 5) Return the updated document
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

export const getMyService = async (req, res) => {
  try {
    const svc = await Service.findOne({ admin: req.user.id })
      .select('serviceName price category duration address businessHours admin')
      .populate('admin', 'name')
      .lean()

    if (!svc) {
      return res.status(200).json({
        success: true,
        service: null,
        message: 'No services founds. Please create one first.',
      })
    }

    return res.status(200).json({ success: true, service: svc })
  } catch (err) {
    console.error('Get my service error:', err)
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
