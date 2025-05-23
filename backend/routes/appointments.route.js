import express from 'express'
import passport from 'passport'
import { authorizeRoles } from '../middleware/roleCheck.js'
import {
  bookAppointment,
  getMyBookings,
  getAllBookings,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js'

const router = express.Router()

// User routes
router.use(passport.authenticate('jwt', { session: false }))
router.post('/', authorizeRoles('user'), bookAppointment)
router.get('/', authorizeRoles('user'), getMyBookings)
router.delete('/:id', authorizeRoles('user'), cancelAppointment)

// Admin routes
router.get('/admin', authorizeRoles('admin'), getAllBookings)
router.put('/:id/status', authorizeRoles('admin'), updateAppointmentStatus)

export default router
