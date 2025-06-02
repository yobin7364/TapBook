import mongoose from 'mongoose'
import Appointment from '../models/Appointment.module.js'
import User from '../models/User.module.js'
import Service from '../models/Service.module.js'
import { Parser as Json2csvParser } from 'json2csv'
export const adminListAppointments = async (req, res) => {
  try {
    // Find all services owned by this admin
    const services = await Service.find({ admin: req.user.id }).select('_id')
    const serviceIds = services.map((svc) => svc._id)

    // Optionally filter by status
    const { status } = req.query
    const statusFilter = status ? { status } : {}

    // Get appointments for these services
    const appointments = await Appointment.find({
      service: { $in: serviceIds },
      ...statusFilter,
    })
      .populate('customer', 'name email')
      .populate('service', 'serviceName category')

    // Format as needed for frontend
    const formatted = appointments.map((appt) => ({
      id: appt._id,
      client: {
        name: appt.customer.name,
        email: appt.customer.email,
      },
      service: {
        serviceName: appt.service.serviceName,
        category: appt.service.category,
      },
      date: appt.slot.start,
      status: appt.status,
    }))

    return res.json({ success: true, appointments: formatted })
  } catch (err) {
    console.error('List appointments error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

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


// @route   POST /api/admin/appointments/batch-cancel-by-date
// @desc    Cancel (set status: 'cancelled') all appointments on a specific date or date range
// @body    { start: ISOString, end: ISOString }
// @access  Private (admin)
export const batchCancelByDate = async (req, res) => {
  const { start, end } = req.body

  if (!start && !end) {
    return res.status(400).json({ success: false, error: 'Start or end date required' })
  }

  // Default: cancel one whole day if only start is provided
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : new Date(startDate)
  if (!end) {
    endDate.setHours(23, 59, 59, 999)
  }

  try {
    // Only cancel "pending" or "confirmed" appointments in that date range
    const result = await Appointment.updateMany(
      {
        'slot.start': { $gte: startDate, $lte: endDate },
        status: { $in: ['pending', 'confirmed'] }
      },
      { $set: { status: 'cancelled' } }
    )
    return res.json({
      success: true,
      cancelledCount: result.modifiedCount || result.nModified || 0,
      range: { start: startDate, end: endDate }
    })
  } catch (err) {
    console.error('Batch cancel by date error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
//Export Bookings
export const exportBookings = async (req, res) => {
  try {
    const { from, to, status, service } = req.query
    const adminId = req.user.id               // ← pulled from JWT!

    // 1) build filter on createdAt, status, service
    const match = { }
    if (from || to) {
      match.createdAt = {}
      if (from) match.createdAt.$gte = new Date(from)
      if (to)   match.createdAt.$lte = new Date(`${to}T23:59:59.999Z`)
    }
    if (status && status !== 'all'){  match.status  = status}
    if (service) match.service = new mongoose.Types.ObjectId(service)

    // 2) initial pipeline
    const pipeline = [{ $match: match }]

    // 3) automatically filter to only this admin’s services
    pipeline.push(
      { $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'svc'
        }
      },
      { $unwind: '$svc' },
      { $match: { 'svc.admin': new mongoose.Types.ObjectId(adminId) } }
    )

    // 4) join customer + service details
    pipeline.push(
      { $lookup: {
          from: 'users',
          localField: 'customer',
          foreignField: '_id',
          as: 'cust'
        }
      },
      { $unwind: '$cust' },
      // svc is already joined above
    )

    const bookings = await Appointment.aggregate(pipeline)

    const report = bookings.map(b => ({
      AppointmentID: b._id.toString(),
      CustomerName:  b.cust.name,
      CustomerEmail: b.cust.email,
      ServiceTitle:  b.svc.
      serviceName || b.svc.title,
      PaymentAmount: b.payment?.totalDue ?? 0,
      Status:        b.status,
      BookedAt:      b.createdAt.toISOString(),
      ScheduledAt:   b.scheduledAt?.toISOString() || ''
    }))

    return res.json({ success: true, report, total: report.length })
  } catch (err) {
    console.error('Export error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
