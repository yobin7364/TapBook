import express from 'express'
import passport from 'passport'
import { authorizeRoles } from '../middleware/roleCheck.js'
import {
  createService,
  listServices,
  updateService,
  deleteService,
} from '../controllers/serviceController.js'

const router = express.Router()

// Public listing
router.get('/', listServices)

// Admin CRUD
router.use(
  passport.authenticate('jwt', { session: false }),
  authorizeRoles('admin')
)
router.post('/', createService)
router.put('/:id', updateService)
router.delete('/:id', deleteService)

export default router
