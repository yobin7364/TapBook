import express from 'express'
const router = express.Router()
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import keys from '../config/keys.config.js'
import passport from 'passport'
import { validateRegistration } from '../validator/register.validator.js'
import { validateLoginInput } from '../validator/login.validator.js'
import {
  forgotPassword,
  resetPassword,
} from '../controllers/resetPassword.controller.js'

import User from '../models/User.module.js'
import {registerUser, loginUser,updateUser, deleteUser} from '../controllers/userController.js'
import { changePassword } from '../controllers/changePassword.controller.js'
import { authorizeUserOrAdmin } from '../middleware/auth.js'

// Access the secretOrKey from the dynamically imported keys
const secret = keys.secretOrKey


//@route  GET /api/users/test
//@desc   Tests post route
//@access Public
router.get('/test', (req, res) => res.json({ msg: 'User Works' }))
//@route  GET /api/users/register
//@desc   Register a new user
//@access Private
router.post('/register', registerUser)
//@route  GET /api/users/login
//@desc   Login user
//@access Private
router.post('/login', loginUser)


//@route POST /api/users/change-password
router.post(
  '/change-password',
  passport.authenticate('jwt', { session: false }),
  changePassword
)

//@route  GET /api/users/current
//@desc   Return current user
//@access Private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  authorizeUserOrAdmin,
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    })
  }
)
// @route   POST /api/users/forgot-password
router.post('/forgot-password', forgotPassword)

// @route   POST /api/users/reset-password/:token
router.post('/reset-password/:token', resetPassword)


// @route   PUT /api/users/:id
// @desc    Update a user (admin or self)
// @access  Private
router.put('/:id', passport.authenticate('jwt', { session: false }), updateUser)

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin or self)
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  deleteUser
)
export default router
