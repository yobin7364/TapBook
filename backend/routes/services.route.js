import express from 'express'
import passport from 'passport'
import { publicListServices,getServiceById } from '../controllers/serviceController.js'
import { getAvailableSlots } from '../controllers/availableSlots.Controller.js'
import { getCategories } from '../controllers/serviceController.js'
const router = express.Router()
import { getServices,getMyService } from '../controllers/serviceController.js'
// @route   GET /api/services
// @desc    List & filter services (public)
// @access  Public
router.get('/categories', getCategories)
router.get('/', publicListServices)
router.get('/:id/available-slots', getAvailableSlots)
// Public endpoint for fetching & filtering services
// GET /api/services?search=…&category=…&date=…&startTime=…&endTime=…&minRating=…&sortBy=…&sortOrder=…&page=…&limit=…
router.get('/', getServices)
router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  getMyService
)
router.get('/:id', getServiceById)

export default router
