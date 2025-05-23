import bcrypt from 'bcryptjs'
import User from '../models/User.module.js'
import { validateChangePassword } from '../validator/changePassword.validator.js'

// @route   POST /api/users/change-password
// @desc    Change password for logged-in user
// @access  Private
export const changePassword = async (req, res) => {
  const { errors, isValid } = validateChangePassword(req.body)
  const { oldPassword, newPassword } = req.body
  const userId = req.user.id

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors,
      },
    })
  }

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: { message: 'User not found' } })
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Incorrect password',
          details: { oldPassword: 'Old password is incorrect' },
        },
      })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (err) {
    console.error('Change password error:', err)
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        details: { server: 'Something went wrong while changing the password' },
      },
    })
  }
}
