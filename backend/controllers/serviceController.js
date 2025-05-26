import Service from '../models/Service.module.js'
import { validateService } from '../validator/service.validator.js'
import Review from '../models/Review.module.js'
import Appointment from '../models/Appointment.module.js'
import { validateReview } from '../validator/review.validator.js'

export const publicListServices = async (req, res) => {
  try {
    // 1) Parse filters
    const {
      q, // keyword search
      category,
      minPrice,
      maxPrice,
      minRating,
      start, // ISO date for slot start
      end, // ISO date for slot end
    } = req.query

    // 2) Build a Mongoose match object for services
    const serviceMatch = {}
    if (q) serviceMatch.title = { $regex: q, $options: 'i' }
    if (category) serviceMatch.category = category
    if (minPrice)
      serviceMatch.price = { ...serviceMatch.price, $gte: +minPrice }
    if (maxPrice)
      serviceMatch.price = { ...serviceMatch.price, $lte: +maxPrice }

    // 3) Start aggregation
    const pipeline = [
      { $match: serviceMatch },
      // bring in admin info
      {
        $lookup: {
          from: 'users',
          localField: 'admin',
          foreignField: '_id',
          as: 'admin',
        },
      },
      { $unwind: '$admin' },
      // compute review stats
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
      // filter by rating if requested
      ...(minRating ? [{ $match: { avgRating: { $gte: +minRating } } }] : []),
    ]

    // 4) If time-slot filters provided, only keep services whose admin has availability
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
                start: { $lt: endDate }, // slot begins before your end
                end: { $gt: startDate }, // slot ends after your start
              },
            },
          },
        }
      )
    }

    // 5) Project only necessary fields
    pipeline.push({
      $project: {
        id: '$_id',
        title: 1,
        description: 1,
        category: 1,
        price: 1,
        duration: 1,
        admin: {
          id: '$admin._id',
          name: '$admin.name',
          email: '$admin.email',
        },
        avgRating: 1,
        reviewCount: 1,
      },
    })

    // 6) Execute and return
    const services = await Service.aggregate(pipeline)
    return res.json({ success: true, services })
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

  try {
    const service = new Service({
      admin: req.user.id, // ← user must be admin
      ...req.body,
    })
    await service.save()
    return res.status(201).json({ success: true, service })
  } catch (err) {
    console.error('Service creation error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
// @route   GET /api/admin/services
// @desc    List all services with rating info (admin view)
// @access  Private (admin)
export const listServices = async (req, res) => {
  try {
    // 1) Fetch raw services
    const services = await Service.find()
      .populate('admin', 'name email')

    // 2) For each service, compute avgRating + reviewCount
    const results = await Promise.all(
      services.map(async (svc) => {
        const stats = await Review.aggregate([
          { $match: { reviewee: svc.admin._id } },
          {
            $group: {
              _id: '$reviewee',
              avgRating:   { $avg: '$rating' },
              reviewCount: { $sum: 1 }
            }
          }
        ])

        // stats[0] may be undefined if no reviews
        const { avgRating = 0, reviewCount = 0 } = stats[0] || {}

        return {
          id:          svc._id,
          title:       svc.title,
          description: svc.description,
          category:    svc.category,
          price:       svc.price,
          duration:    svc.duration,
          admin:       svc.admin,
          avgRating,
          reviewCount
        }
      })
    )

    return res.json({ success: true, services: results })
  } catch (err) {
    console.error('List services error:', err)
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
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, admin: req.user.id }, // ← match on admin
      req.body,
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
      admin: req.user.id, // ← match on admin
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
    // 1) Verify appointment exists
    const appt = await Appointment.findById(appointment)
    if (!appt) {
      return res
        .status(404)
        .json({ success: false, error: 'Appointment not found' })
    }

    // 2) Only the admin who owns the service can review
    const svc = await Service.findById(appt.service)
    if (!svc || svc.admin.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, error: 'Not authorized to review this customer' })
    }

    // 3) Only completed or cancelled appointments can be reviewed
    if (!['confirmed','cancelled'].includes(appt.status)) {
      return res
        .status(400)
        .json({ success: false, error: 'Can only review completed or cancelled appointments' })
    }

    // 4) Prevent duplicate review for same appointment
    if (await Review.findOne({ appointment })) {
      return res
        .status(400)
        .json({ success: false, error: 'Review already exists for this appointment' })
    }

    // 5) Create the review, reviewer=req.user.id, reviewee=customer
    const review = new Review({
      appointment,
      reviewer: req.user.id,         // admin
      reviewee:  appt.customer,      // customer
      service:   appt.service,
      rating,
      comment
    })
    await review.save()
    return res.status(201).json({ success: true, review })

  } catch (err) {
    console.error('Create customer review error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

