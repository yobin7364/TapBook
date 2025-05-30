import express from 'express'
import passport from 'passport'
import { authorizeRoles } from '../middleware/roleCheck.js'
import {
  getStats,
  listUsers,
  deleteUser,
  bookingReport,
  revenueReport,
} from '../controllers/adminController.js'

const router = express.Router()

// All admin‐only routes
router.use(
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('admin')
)

// System stats
// GET /api/admin/dashboard/stats
router.get('/stats', getStats)

// User management
// GET /api/admin/dashboard/users
router.get('/users', listUsers)
// DELETE /api/admin/dashboard/users/:id
router.delete('/users/:id', deleteUser)

// Booking reports
// GET /api/admin/dashboard/reports/bookings
router.get('/reports/bookings', bookingReport)

// Revenue reports
// GET /api/admin/dashboard/reports/revenue
router.get('/reports/revenue', revenueReport)

export default router
