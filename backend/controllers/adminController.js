import mongoose from 'mongoose'
import User from '../models/User.module.js'
import Service from '../models/Service.module.js'
import Appointment from '../models/Appointment.module.js'
import Review from '../models/Review.module.js'


export const getStats = async (req, res) => {
  try {
    const adminId = new mongoose.Types.ObjectId(req.user.id)

    // 1) Find all services that belong to this admin
    const services = await Service.find({ admin: adminId }, { _id: 1 }).lean()
    const serviceIds = services.map((s) => s._id)

    // If the admin owns no services, return zeros/empty immediately
    if (serviceIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          bookingCount: 0,
          activeUserCount: 0,
          totalRevenue: 0,
          bookingsByWeek: [0, 0, 0, 0, 0, 0, 0],
          statusCounts: {
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            pending: 0,
            scheduled: 0,
          },
          recentActivity: [],
        },
      })
    }

    // 2) Total number of appointments for THIS admin’s services
    const bookingCountPromise = Appointment.countDocuments({
      service: { $in: serviceIds },
    })

    // 3) Number of distinct customers who ever booked one of these services
    const activeUserCountPromise = Appointment.distinct('customer', {
      service: { $in: serviceIds },
    }).then((userIds) => userIds.length)

    // 4) Total revenue from COMPLETED appointments on these services
    const totalRevenuePromise = Appointment.aggregate([
      {
        $match: {
          service: { $in: serviceIds },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          sum: { $sum: '$payment.totalDue' },
        },
      },
    ]).then((arr) => arr[0]?.sum || 0)

    // 5) Bookings by weekday for the past 7 days (based on createdAt)
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const bookingsByWeekPromise = Appointment.aggregate([
      {
        $match: {
          service: { $in: serviceIds },
          createdAt: { $gte: sevenDaysAgo, $lte: now },
        },
      },
      {
        $project: {
          dayIndex: {
            $floor: {
              $divide: [
                { $subtract: ['$createdAt', sevenDaysAgo] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: '$dayIndex',
          count: { $sum: 1 },
        },
      },
    ]).then((results) => {
      // initialize array [0,0,0,0,0,0,0] for indices 0=SUNDAY … 6=SATURDAY
      const arr = [0, 0, 0, 0, 0, 0, 0]
      results.forEach((r) => {
        const idx = parseInt(r._id, 10)
        if (idx >= 0 && idx <= 6) {
          arr[idx] = r.count
        }
      })
      return arr
    })

    // 6) Status counts for THIS admin’s appointments
    const statuses = [
      'confirmed',
      'completed',
      'cancelled',
      'pending',
      'scheduled',
    ]
    const statusCountsPromise = Appointment.aggregate([
      {
        $match: { service: { $in: serviceIds } },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]).then((arr) => {
      const counts = {
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
        scheduled: 0,
      }
      arr.forEach((r) => {
        if (counts.hasOwnProperty(r._id)) {
          counts[r._id] = r.count
        }
      })
      return counts
    })

    // 7) Recent activity: latest 5 appointments (any status) on these services
    const recentActivityPromise = Appointment.find({
      service: { $in: serviceIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name')
      .populate('service', 'serviceName')
      .lean()
      .then(async (appts) => {
        return Promise.all(
          appts.map(async (appt) => {
            const localDT = new Date(appt.slot.start)
            const dateStr = localDT.toLocaleDateString('en-CA', {
              timeZone: 'Australia/Sydney',
            })
            const timeStr = localDT.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Australia/Sydney',
            })

            const review = await Review.findOne({ appointment: appt._id })
            return {
              customer: appt.customer.name || '',
              date: dateStr,
              time: timeStr,
              status: appt.status,
              rating: review ? review.rating : '-',
              reviewDescription: review ? review.comment : '-',
            }
          })
        )
      })

    // 8) Await all promises in parallel
    const [
      bookingCount,
      activeUserCount,
      totalRevenue,
      bookingsByWeek,
      statusCounts,
      recentActivity,
    ] = await Promise.all([
      bookingCountPromise,
      activeUserCountPromise,
      totalRevenuePromise,
      bookingsByWeekPromise,
      statusCountsPromise,
      recentActivityPromise,
    ])

    return res.json({
      success: true,
      stats: {
        bookingCount,
        activeUserCount,
        totalRevenue,
        bookingsByWeek,
        statusCounts,
        recentActivity,
      },
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
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
