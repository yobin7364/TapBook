// backend/controllers/notification.controller.js
import Notification from '../models/Notification.module.js'

// @route   GET /api/notifications
// @desc    List user notifications (status‐change, reminders, etc.), paginated
// @access  Private (user)
export const getNotifications = async (req, res) => {
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
      .lean()

    const notifications = notes.map((n) => ({
      id: n._id,
      type: n.type, // 'status' or 'reminder'
      message: n.message,
      appointment: n.appointment, // optional appointment _id
      read: n.read,
      date: n.createdAt,
    }))

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
