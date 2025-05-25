import express from 'express'
import passport from 'passport'
import { authorizeRoles } from '../middleware/roleCheck.js'
import {
  createReview,
  getReviewsForUser,
  updateReview
} from '../controllers/reviewController.js'

const router = express.Router()

// All routes require authentication
router.use(passport.authenticate('jwt', { session: false }))

// @route   POST /api/reviews
// @desc    Submit a review
// @access  Private (user)
router.post('/', authorizeRoles('user'), createReview)

// @route   GET /api/reviews/user/:id
// @desc    View reviews about a user
// @access  Public
router.get('/user/:id', getReviewsForUser)
// @route   PUT /api/reviews/:id
// @desc    Edit your own review
// @access  Private (user)
router.put('/:id', authorizeRoles('user'), updateReview)
export default router
