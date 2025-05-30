import Review from '../models/Review.module.js'
import Appointment from '../models/Appointment.module.js'
import { validateReview } from '../validator/review.validator.js'
import Service from '../models/Service.module.js'


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
}// @route   GET /api/reviews/user/:id
// @desc    Get all reviews for a given user (paginated)
// @access  Public
export const getReviewsForUser = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  try {
    // Find reviews for the provider
    const [reviews, total] = await Promise.all([
      Review.find({ reviewee: req.params.id })
        .populate('reviewer', 'name email')
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ reviewee: req.params.id }),
    ])

    return res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get reviews error:', err)
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
    if (await Review.findOne({ appointment })) {
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
