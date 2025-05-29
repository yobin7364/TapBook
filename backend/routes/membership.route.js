import express from 'express'
import {
  subscribeMembership,
  cancelMembership,
  getMembership,
} from '../controllers/membershipController.js'

import passport from 'passport'
const router = express.Router()

router.post(
  '/subscribe',
  passport.authenticate('jwt', { session: false }),
  subscribeMembership
)
router.post(
  '/cancel',
  passport.authenticate('jwt', { session: false }),
  cancelMembership
)
router.get('/', passport.authenticate('jwt', { session: false }), getMembership)


export default router
