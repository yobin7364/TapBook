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
    if (!['confirmed', 'cancelled'].includes(appt.status)) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Can only review completed or cancelled appointments',
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
}
// @route   GET /api/reviews/user/:id
// @desc    Get all reviews for a given user
// @access  Public
export const getReviewsForUser = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id }).populate(
      'reviewer',
      'name email'
    )
    return res.json({ success: true, reviews })
  } catch (err) {
    console.error('Get reviews error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
