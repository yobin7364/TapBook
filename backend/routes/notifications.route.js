import express from 'express'
import passport from 'passport'
import { getNotifications } from '../controllers/notification.controller.js'

const router = express.Router()

// GET /api/notifications
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  getNotifications
)

export default router
