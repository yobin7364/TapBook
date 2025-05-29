import mongoose from 'mongoose'
import User from '../models/User.module.js'
import Service from '../models/Service.module.js'
import Appointment from '../models/Appointment.module.js'
import Review from '../models/Review.module.js'

export const getStats = async (req, res) => {
  try {
    // 1. Basic counts
    const [bookingCount, userCount, serviceCount] = await Promise.all([
      Appointment.countDocuments(),
      User.countDocuments(),
      // import and count your Service model if you want this
    ])

    // 2. Active users (users with at least one booking)
    const activeUsers = await Appointment.distinct('customer')
    const activeUserCount = activeUsers.length

    // 3. Total Revenue (sum totalDue if present, else fallback to service.price)
    const completedBookings = await Appointment.find({
      status: { $in: ['confirmed', 'completed'] },
    }).populate('service')
    const totalRevenue = completedBookings.reduce((sum, appt) => {
      // If you store totalDue in appointment, otherwise use service.price
      return sum + (appt.summary?.totalDue || appt.service?.price || 0)
    }, 0)

    // 4. Bookings by week (for the past 7 days, grouped by weekday)
    const startOfWeek = (() => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - d.getDay()) // set to Sunday
      return d
    })()

    // All appointments in current week
    const weekBookings = await Appointment.find({
      createdAt: { $gte: startOfWeek },
    })

    const bookingsByWeek = [0, 0, 0, 0, 0, 0, 0] // S, M, T, W, T, F, S
    weekBookings.forEach((appt) => {
      const day = new Date(appt.createdAt).getDay()
      bookingsByWeek[day]++
    })

    // 5. Booking status counts (confirmed, completed, cancelled)
    const statuses = [
      'confirmed',
      'completed',
      'cancelled',
      'pending',
      'scheduled',
    ]
    const statusCounts = {}
    for (const status of statuses) {
      statusCounts[status] = await Appointment.countDocuments({ status })
    }

    // 6. Recent activity (latest 5 appointments, with customer name, date, time, status, and rating)
    const recentBookings = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name')
      .populate('service', 'title')

    const recentActivity = await Promise.all(
      recentBookings.map(async (appt) => {
        // Look up review for this appointment
        const review = await Review.findOne({ appointment: appt._id })
        return {
          customer: appt.customer?.name || '',
          date: appt.scheduledAt?.toISOString().split('T')[0],
          time: appt.scheduledAt
            ? new Date(appt.scheduledAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          status: appt.status,
          rating: review ? review.rating : '-', // show rating if review found
          reviewDescription: review ? review.comment : '-', // NEW: show review comment if exists
        }
      })
    )


    return res.json({
      success: true,
      stats: {
        bookingCount,
        activeUserCount,
        totalRevenue,
        bookingsByWeek, // array of 7 numbers [S, M, T, W, T, F, S]
        statusCounts, // { confirmed: X, completed: Y, cancelled: Z, ... }
        recentActivity, // array of objects as above
      },
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
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
