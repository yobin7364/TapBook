import express from 'express'
import { publicListServices } from '../controllers/serviceController.js'

const router = express.Router()

// @route   GET /api/services
// @desc    List & filter services (public)
// @access  Public
router.get('/', publicListServices)

export default router
