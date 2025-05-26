import mongoose from 'mongoose'
import Appointment from '../models/Appointment.module.js'
import User from '../models/User.module.js'
import Service from '../models/Service.module.js'
import { Parser as Json2csvParser } from 'json2csv'

/**
 * @route   POST /api/admin/appointments/batch
 * @desc    Batch-update appointment status
 * @body    { ids: [String], status: String }
 * @access  Private (admin)
 */
export const batchUpdateStatus = async (req, res) => {
  const { ids, status } = req.body
  if (!Array.isArray(ids) || !ids.length) {
    return res
      .status(400)
      .json({ success: false, error: '`ids` must be a non-empty array' })
  }
  if (!['pending', 'confirmed', 'declined', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' })
  }

  try {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
    const result = await Appointment.updateMany(
      { _id: { $in: objectIds } },
      { $set: { status } }
    )
    return res.json({
      success: true,
      modifiedCount: result.nModified ?? result.modifiedCount,
    })
  } catch (err) {
    console.error('Batch update error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

/**
 * @route   DELETE /api/admin/appointments/batch
 * @desc    Batch-cancel (delete) appointments
 * @body    { ids: [String] }
 * @access  Private (admin)
 */
export const batchCancel = async (req, res) => {
  const { ids } = req.body
  if (!Array.isArray(ids) || !ids.length) {
    return res
      .status(400)
      .json({ success: false, error: '`ids` must be a non-empty array' })
  }

  try {
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))
    const result = await Appointment.deleteMany({ _id: { $in: objectIds } })
    return res.json({
      success: true,
      deletedCount: result.deletedCount,
    })
  } catch (err) {
    console.error('Batch cancel error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

/**
 * @route   GET /api/admin/appointments/export
 * @desc    Export bookings as CSV (optionally filtered)
 * @query   from, to, status, service, admin
 * @access  Private (admin)
 */
export const exportBookings = async (req, res) => {
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

    // Fetch with populated fields
    const bookings = await Appointment.aggregate([
      ...pipeline,
      {
        $lookup: {
          from: 'users',
          localField: 'customer',
          foreignField: '_id',
          as: 'cust',
        },
      },
      { $unwind: '$cust' },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'svc',
        },
      },
      { $unwind: '$svc' },
    ])

    // Map to flat objects for CSV
    const data = bookings.map((b) => ({
      AppointmentID: b._id.toString(),
      CustomerName: b.cust.name,
      CustomerEmail: b.cust.email,
      ServiceTitle: b.svc.title,
      Status: b.status,
      BookedAt: b.createdAt.toISOString(),
      ScheduledAt: b.scheduledAt?.toISOString() || '',
    }))

    const fields = Object.keys(data[0] || {})
    const parser = new Json2csvParser({ fields })
    const csv = parser.parse(data)

    res.header('Content-Type', 'text/csv')
    res.attachment('bookings_export.csv')
    return res.send(csv)
  } catch (err) {
    console.error('Export error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
