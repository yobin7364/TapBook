import bcrypt from 'bcryptjs'
import User from '../models/User.module.js'
import jwt from 'jsonwebtoken'
import keys from '../config/keys.config.js'
import { validateUpdateUser } from '../validator/update.validator.js'
import { validateRegistration } from '../validator/register.validator.js'
import { validateLoginInput } from '../validator/login.validator.js'
import {validateChangePassword}from '../validator/changePassword.validator.js'

const secret = keys.secretOrKey
// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  const { errors, isValid } = validateRegistration(req.body)

  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  try {
    const existingUser = await User.findOne({ email: req.body.email })
    if (existingUser) {
      errors.email = 'This email is already registered.'
      return res.status(400).json({ success: false, errors })
    }

    if (!['user', 'admin'].includes(req.body.role)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: { role: 'Invalid role selected' },
        },
      })
    }

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    })

    const salt = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(newUser.password, salt)

    const savedUser = await newUser.save()

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        details: { server: 'An error occurred while registering the user' },
      },
    })
  }
}

// @desc    Login a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body)

  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  const { email, password, role: selectedRole } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        errors: { email: 'Email not found' },
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        errors: { password: 'Password incorrect' },
      })
    }

    if (user.role !== selectedRole) {
      return res.status(400).json({
        success: false,
        errors: { role: `User does not have role: ${selectedRole}` },
      })
    }

    const payload = { id: user.id, name: user.name, role: user.role }

    jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'Token error',
            details: { token: 'Error signing the token' },
          },
        })
      }

      res.json({
        success: true,
        token: 'Bearer ' + token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          selectedRole,
        },
      })
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        details: { server: 'An error occurred during login' },
      },
    })
  }
}
// @desc    Update user (admin or self)
export const updateUser = async (req, res) => {
   const { errors, isValid } = validateUpdateUser(req.body)
  const { id } = req.params
  const userData = req.user
  const { name, email, password } = req.body

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors,
      },
    })
  }
  if (userData.role !== 'admin' && userData.id !== id) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Permission denied',
        details: { user: 'Not authorized to update this user.' },
      },
    })
  }

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          details: { id: 'No user exists with the given ID' },
        },
      })
    }

    if (name) user.name = name
    if (email) user.email = email
    if (password) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
    }

    const updatedUser = await user.save()
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    })
  } catch (err) {
    console.error('Update error:', err)
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        details: { server: 'Something went wrong while updating the user' },
      },
    })
  }
}

// @desc    Delete user (admin or self)
export const deleteUser = async (req, res) => {
  const { id } = req.params
  const userData = req.user

  if (userData.role !== 'admin' && userData.id !== id) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Permission denied',
        details: { user: 'Not authorized to delete this user.' },
      },
    })
  }

  try {
    const user = await User.findByIdAndDelete(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          details: { id: 'No user found to delete' },
        },
      })
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (err) {
    console.error('Delete error:', err)
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        details: { server: 'Something went wrong while deleting the user' },
      },
    })
  }
}
