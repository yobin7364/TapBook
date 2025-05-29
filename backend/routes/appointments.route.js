import express from 'express'
import passport from 'passport'
import { authorizeRoles } from '../middleware/roleCheck.js'
import {
  bookAppointment,
  getUpcomingAppointments,
  getMyBookings,
  getMyBookingById,
  getAllBookings,
  updateAppointmentStatus,
  cancelAppointment,
  previewAppointment
} from '../controllers/appointmentController.js'
import { batchCancelByDate } from '../controllers/adminAppointmentController.js'
import { getNotifications } from '../controllers/appointmentController.js'

const router = express.Router()

// User routes
router.use(passport.authenticate('jwt', { session: false }))
// Book a new appointment
router.post('/', passport.authenticate('jwt', { session: false }), bookAppointment)
router.post(
  '/summary',
  passport.authenticate('jwt', { session: false }),
  previewAppointment
)
// List all appointments for the logged-in user
router.get('/', passport.authenticate('jwt', { session: false }), getMyBookings)
router.get(
  '/upcoming',
  passport.authenticate('jwt', { session: false }),
  getUpcomingAppointments
)
router.get(
  '/notifications',
  passport.authenticate('jwt', { session: false }),
  getNotifications
)

// Cancel (user) appointment
router.put('/:id/cancel', passport.authenticate('jwt', { session: false }), cancelAppointment)

// Admin routes

router.get('/admin', authorizeRoles('admin'), getAllBookings)
router.put('/:id/status', authorizeRoles('admin'), updateAppointmentStatus)
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  getMyBookingById
)

export default router
