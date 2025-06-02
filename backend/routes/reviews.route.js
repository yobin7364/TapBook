import express from 'express'
import passport from 'passport'
import { authorizeRoles } from '../middleware/roleCheck.js'
import {
  createReview,
  updateReview,
  getMyUserReviews,
  listCustomerReviews
} from '../controllers/reviewController.js'

const router = express.Router()

// All routes require authentication
router.use(passport.authenticate('jwt', { session: false }))

// @route   POST /api/reviews
// @desc    Submit a review
// @access  Private (user)
router.post('/', authorizeRoles('user'), createReview)

// Only admins/providers can hit this; passportAuth ensures req.user is set
router.get(
  '/mine',
  passport.authenticate('jwt', { session: false }),
  getMyUserReviews
)

router.get('/admin', passport.authenticate('jwt', { session: false }), listCustomerReviews)
// @route   PUT /api/reviews/:id
// @desc    Edit your own review
// @access  Private (user)
router.put('/:id', authorizeRoles('user'), updateReview)
export default router
