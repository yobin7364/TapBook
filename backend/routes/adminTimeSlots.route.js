import express from 'express'
import passport from 'passport'
import { authorizeRoles } from '../middleware/roleCheck.js'
import {
  addTimeSlot,
  getTimeSlots,
  deleteTimeSlot,
} from '../controllers/timeSlotController.js'

const router = express.Router()

// Only admins can manage time slots now
router.use(
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('admin')
)

router.post('/', addTimeSlot)
router.get('/', getTimeSlots)
router.delete('/:slotId', deleteTimeSlot)

export default router
