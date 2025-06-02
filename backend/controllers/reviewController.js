import Review from '../models/Review.module.js'
import Appointment from '../models/Appointment.module.js'
import { validateReview } from '../validator/review.validator.js'
import Service from '../models/Service.module.js'
import mongoose from 'mongoose'

// @route   POST /api/reviews
// @desc    Create a review for a completed appointment
// @access  Private (user)
export const createReview = async (req, res) => {
  const { errors, isValid } = validateReview(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  const { appointment, rating, comment } = req.body
  try {
    const appt = await Appointment.findById(appointment)
    if (!appt || appt.customer.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ success: false, error: 'Appointment not found or not yours' })
    }
if (appt.status !== 'completed') {
  return res.status(400).json({
    success: false,
    error: 'Can only review completed appointments',
  })
}


    // Look up the service to find the admin who provided it
    const svc = await Service.findById(appt.service)
    if (!svc) {
      return res
        .status(500)
        .json({ success: false, error: 'Service data missing' })
    }

    // Prevent duplicates
    if (await Review.findOne({ appointment })) {
      return res
        .status(400)
        .json({ success: false, error: 'Review already submitted' })
    }

    const review = new Review({
      appointment,
      reviewer: req.user.id,
      reviewee: svc.admin,
      rating,
      comment,
    })
    await review.save()
    return res.status(201).json({ success: true, review })
  } catch (err) {
    console.error('Create review error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}// @route   GET /api/reviews/mine
// @desc    Admin sees all reviews made by users on themselves (paginated)
// @access  Private (admin only)
export const getMyUserReviews = async (req, res) => {
  const page  = Math.max(parseInt(req.query.page)  || 1,  1)
  const limit = Math.max(parseInt(req.query.limit) || 10, 1)
  const skip  = (page - 1) * limit

  try {
    const myId = req.user.id

    if (!mongoose.Types.ObjectId.isValid(myId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' })
    }

    // 1) Count only those reviews where reviewee = me AND reviewer.role = "user"
    //    We’ll do a two‐stage aggregation: first match reviewee, then lookup reviewer to filter by role.
    const countAgg = await Review.aggregate([
      { $match: { reviewee: new mongoose.Types.ObjectId(myId) } },
      {
        $lookup: {
          from:        'users',
          localField:  'reviewer',
          foreignField:'_id',
          as:          'revUser'
        }
      },
      { $unwind: '$revUser' },
      { $match: { 'revUser.role': 'user' } },
      { $count: 'total' }
    ])
    const total = countAgg[0]?.total || 0

    // 2) Fetch one page of those same reviews, again joined with reviewer’s name/email
    const reviews = await Review.aggregate([
      { $match: { reviewee: new mongoose.Types.ObjectId(myId) } },
      {
        $lookup: {
          from:        'users',
          localField:  'reviewer',
          foreignField:'_id',
          as:          'revUser'
        }
      },
      { $unwind: '$revUser' },
      { $match: { 'revUser.role': 'user' } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id:         1,
          appointment: 1,
          rating:      1,
          comment:     1,
          createdAt:   1,
          'reviewer._id':   '$revUser._id',
          'reviewer.name':  '$revUser.name',
          'reviewer.email': '$revUser.email'
        }
      }
    ])

    return res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    })
  } catch (err) {
    console.error('Get my user‐made reviews error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
// @route   PUT /api/reviews/:id
// @desc    Edit a review (customer only)
// @access  Private (user)
export const updateReview = async (req, res) => {
  const { errors, isValid } = validateReview(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  try {
    // Only allow the original reviewer to edit
    const review = await Review.findOne({
      _id: req.params.id,
      reviewer: req.user.id
    })
    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: 'Review not found or not yours to edit' })
    }

    // Update fields
    review.rating  = req.body.rating
    review.comment = req.body.comment
    await review.save()

    return res.json({ success: true, review })
  } catch (err) {
    console.error('Update review error:', err)
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
    // 1) Find the appointment
    const appt = await Appointment.findById(appointment)
    if (!appt) {
      return res.status(404).json({ success: false, error: 'Appointment not found' })
    }

    // 2) Ensure this admin created the service
    const svc = await Service.findById(appt.service)
    if (!svc || svc.admin.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to review this customer' })
    }

    // 3) Only completed/cancelled appointments
   if (appt.status !== 'completed') {
     return res.status(400).json({
       success: false,
       error: 'Can only review completed appointments',
     })
   }


    // 4) Prevent duplicate
    if (await Review.findOne({ appointment, reviewer: req.user.id })) {
      return res.status(400).json({ success: false, error: 'Review already exists for this appointment' })
    }

    // 5) Create and save
    const review = new Review({
      appointment,
      reviewer: req.user.id,    // admin
      reviewee:  appt.customer, // customer
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
// @route   GET /api/admin/reviews
// @desc    List customer-reviews written by this admin
// @access  Private (admin)
export const listCustomerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate('reviewee','name email')   // show customer info
      .populate('appointment','service slot') // optional
    return res.json({ success: true, reviews })
  } catch (err) {
    console.error('List customer reviews error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   PUT /api/admin/reviews/:id
// @desc    Edit a customer-review (admin only)
// @access  Private (admin)
export const updateCustomerReview = async (req, res) => {
  const { errors, isValid } = validateReview(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  try {
    // Only allow the admin who wrote it
    const review = await Review.findOne({
      _id: req.params.id,
      reviewer: req.user.id
    })
    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: 'Review not found or not yours to edit' })
    }

    // Update fields
    review.rating  = req.body.rating
    review.comment = req.body.comment
    await review.save()

    return res.json({ success: true, review })
  } catch (err) {
    console.error('Update customer review error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete a customer review (admin only)
// @access  Private (admin)
export const deleteCustomerReview = async (req, res) => {
  const { id } = req.params

  try {
    // Only allow the admin who wrote it to delete it
    const review = await Review.findOneAndDelete({
      _id: id,
      reviewer: req.user.id
    })

    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: 'Review not found or not yours to delete' })
    }

    return res.json({ success: true, message: 'Review deleted' })
  } catch (err) {
    console.error('Delete customer review error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
