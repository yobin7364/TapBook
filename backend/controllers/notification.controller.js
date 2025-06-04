// backend/controllers/notification.controller.js
import { populate } from 'dotenv'
import Notification from '../models/Notification.module.js'

// @route   GET /api/notifications
// @desc    List user notifications (status‐change, reminders, etc.), paginated
// @access  Private (user)
export const getNotifications = async (req, res) => {
  console.log("AA")
  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = Math.max(parseInt(req.query.limit) || 10, 1)
  const skip = (page - 1) * limit

  try {
    // total count
    const total = await Notification.countDocuments({ user: req.user.id })

    // paginated fetch
    const notes = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'appointment',
        select: 'status service',
        populate: {
          path: 'service',
          select: 'serviceName category admin',
          populate: {
            path: 'admin',
            select: 'name'
          }
        },
      })
      .lean()

    const notifications = notes.map((n) => {
        const appt = n.appointment || {}
        const svc = appt.service || {}
        const adminUser = svc.admin || {}

        return {
          id: n._id,
          message: n.message,
          appointment: n.appointment || null, // optional appointment _id
          serviceName: svc.serviceName || null,
          category: svc.category || null,
          adminName: adminUser.name || null,
          read: n.read,
          date: n.createdAt,
        }})

    return res.json({
      success: true,
      notifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (err) {
    console.error('Get notifications error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
