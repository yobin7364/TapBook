import express from 'express'
import { publicListServices,getServiceById } from '../controllers/serviceController.js'
import { getAvailableSlots } from '../controllers/availableSlots.Controller.js'
import { getCategories } from '../controllers/serviceController.js'
const router = express.Router()

// @route   GET /api/services
// @desc    List & filter services (public)
// @access  Public
router.get('/categories', getCategories)
router.get('/', publicListServices)
router.get('/:id/available-slots', getAvailableSlots)
router.get('/:id', getServiceById)

export default router
