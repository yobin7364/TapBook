import express from 'express'
import passport from 'passport'
import { authorizeRoles } from '../middleware/roleCheck.js'
import {
  batchUpdateStatus,
  batchCancel,
  exportBookings,
} from '../controllers/adminAppointmentController.js'

const router = express.Router()

// All routes require admin
router.use(
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('admin')
)

/**
 * @route   POST /api/admin/appointments/batch
 * @desc    Batch-update appointment status
 */
router.post('/batch', batchUpdateStatus)

/**
 * @route   DELETE /api/admin/appointments/batch
 * @desc    Batch-cancel (delete) appointments
 */
router.delete('/batch', batchCancel)

/**
 * @route   GET /api/admin/appointments/export
 * @desc    Export bookings as CSV
 */
router.get('/export', exportBookings)

export default router
