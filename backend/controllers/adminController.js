import mongoose from 'mongoose'
import User from '../models/User.module.js'
import Service from '../models/Service.module.js'
import Appointment from '../models/Appointment.module.js'

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get overall system statistics
 * @access  Private (admin)
 */
export const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments()
    const serviceCount = await Service.countDocuments()
    const bookingCount = await Appointment.countDocuments()

    // Sum revenue from confirmed bookings
    const revenueResult = await Appointment.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $lookup: {
          from: 'services', // Mongo collection name
          localField: 'service',
          foreignField: '_id',
          as: 'serviceData',
        },
      },
      { $unwind: '$serviceData' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$serviceData.price' },
        },
      },
    ])
    const totalRevenue = revenueResult[0]?.totalRevenue || 0

    return res.json({
      success: true,
      stats: { userCount, serviceCount, bookingCount, totalRevenue },
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

/**
 * @route   GET /api/admin/dashboard/users
 * @desc    List all users
 * @access  Private (admin)
 */
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      '-password -resetPasswordToken -resetTokenExpiry'
    )
    return res.json({ success: true, users })
  } catch (err) {
    console.error('List users error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

/**
 * @route   DELETE /api/admin/dashboard/users/:id
 * @desc    Delete a user account
 * @access  Private (admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }
    return res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    console.error('Delete user error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

/**
 * @route   GET /api/admin/dashboard/reports/bookings
 * @desc    Get bookings filtered by date range, status, and/or service/admin
 * @access  Private (admin)
 * @query   from (YYYY-MM-DD), to (YYYY-MM-DD), status, service, admin
 */
export const bookingReport = async (req, res) => {
  try {
    const { from, to, status, service, admin } = req.query
    const match = {}

    if (from || to) {
      match.createdAt = {}
      if (from) match.createdAt.$gte = new Date(from)
      if (to) match.createdAt.$lte = new Date(`${to}T23:59:59.999Z`)
    }
    if (status) match.status = status
    if (service) match.service = new mongoose.Types.ObjectId(service)

    let pipeline = [{ $match: match }]

    // If filtering by admin (service owner), join & filter
    if (admin) {
      pipeline.push(
        {
          $lookup: {
            from: 'services',
            localField: 'service',
            foreignField: '_id',
            as: 'svc',
          },
        },
        { $unwind: '$svc' },
        { $match: { 'svc.admin': mongoose.Types.ObjectId(admin) } }
      )
    }

    // Optionally project only needed fields
    pipeline.push({
      $project: {
        _id: 1,
        customer: 1,
        service: 1,
        status: 1,
        createdAt: 1,
      },
    })

    const bookings = await Appointment.aggregate(pipeline)
    return res.json({ success: true, bookings })
  } catch (err) {
    console.error('Booking report error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

/**
 * @route   GET /api/admin/dashboard/reports/revenue
 * @desc    Get total revenue (confirmed bookings) over a period
 * @access  Private (admin)
 * @query   from (YYYY-MM-DD), to (YYYY-MM-DD)
 */
export const revenueReport = async (req, res) => {
  try {
    const { from, to } = req.query
    const match = { status: 'confirmed' }

    if (from || to) {
      match.createdAt = {}
      if (from) match.createdAt.$gte = new Date(from)
      if (to) match.createdAt.$lte = new Date(`${to}T23:59:59.999Z`)
    }

    // Sum revenue as before
    const result = await Appointment.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'svc',
        },
      },
      { $unwind: '$svc' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$svc.price' },
        },
      },
    ])

    return res.json({
      success: true,
      totalRevenue: result[0]?.totalRevenue || 0,
    })
  } catch (err) {
    console.error('Revenue report error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
