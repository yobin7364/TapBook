import express from 'express'
import passport from 'passport'
import { authorizeRoles } from '../middleware/roleCheck.js'
import { createCustomerReview, deleteCustomerReview, listCustomerReviews,updateCustomerReview } from '../controllers/reviewController.js'

const router = express.Router()

// All routes here require JWT + admin role
router.use(
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('admin')
)

// @route   POST /api/admin/reviews
// @desc    Admin reviews a customer
// @access  Private (admin)
router.post('/', createCustomerReview)


// @route DELETE /api/admin/reviews/:id
// @desc  Delete a customer review
// @access Private(admin)
router.delete('/:id', deleteCustomerReview)
// @route   PUT /api/admin/reviews/:id
// @desc    Edit a customer review
// @access  Private (admin)
router.put('/:id', updateCustomerReview)
// @route GET /api/admin/reviews
router.get('/', listCustomerReviews)
export default router
