import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import User from '../models/User.module.js'
import { validateResetPassword, validateForgotPassword } from '../validator/resetPassword.validator.js'

// Generate reset token
const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex')
  const hashed = crypto.createHash('sha256').update(token).digest('hex')
  return { token, hashed }
}

// @route   POST /api/users/forgot-password
// @desc    Generate password reset token and send link
// @access  Public
export const forgotPassword = async (req, res) => {

const { errors, isValid } = validateForgotPassword(req.body)
const { email } = req.body

if (!isValid) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  })
}


  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'No user found with this email' })
    }

    const { token, hashed } = generateResetToken()
    user.resetPasswordToken = hashed
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000 // 15 minutes
    await user.save()

    const resetUrl = `http://localhost:4000/reset-password/${token}`

    console.log('🔗 Password Reset Link:', resetUrl)

    return res.status(200).json({
      success: true,
      message: 'Reset password link sent',
      resetLink: resetUrl, // for dev/testing
    })
  } catch (err) {
    console.error('Forgot password error:', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

// @route   POST /api/users/reset-password/:token
// @desc    Reset user password using token
// @access  Public
export const resetPassword = async (req, res) => {
  const { newPassword } = req.body
  const token = req.params.token

const { errors, isValid } = validateResetPassword(req.body)

if (!isValid) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  })
}


  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired',
      })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    user.resetPasswordToken = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Password has been reset',
    })
  } catch (err) {
    console.error('Reset password error:', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
