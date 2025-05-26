import Appointment from '../models/Appointment.module.js'
import Service from '../models/Service.module.js'
import { validateAppointment } from '../validator/appointment.validator.js'
import User from '../models/User.module.js'

// @route   POST /api/appointments
// @desc    Book a new appointment (user)
// @access  Private (user)
export const bookAppointment = async (req, res) => {
  const { errors, isValid } = validateAppointment(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  const { service, slot } = req.body
  const start = new Date(slot.start)
  const end   = new Date(slot.end)
  try {
    // Ensure service exists
    const svc = await Service.findById(service)
    if (!svc) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }

    // 2) Ensure this slot is within the admin's declared availability
    const provider = await User.findById(svc.admin)
    const ok = provider.availableTimeSlots.some((ts) => {
      return ts.start <= start && ts.end >= end
    })
    if (!ok) {
      return res.status(400).json({
        success: false,
        error: 'Requested time is outside provider availability',
      })
    }

    // 3) Prevent double-booking the same provider
    const conflict = await Appointment.findOne({
      service,
      status: { $in: ['pending', 'confirmed'] },
      'slot.start': { $lt: end },
      'slot.end': { $gt: start },
    })
    if (conflict) {
      return res.status(400).json({
        success: false,
        error: 'This time slot is already booked',
      })
    }

    // 4) (Optional) Prevent the same user from double-booking themselves
    const selfConflict = await Appointment.findOne({
      customer: req.user.id,
      status: { $in: ['pending', 'confirmed'] },
      'slot.start': { $lt: end },
      'slot.end': { $gt: start },
    })
    if (selfConflict) {
      return res.status(400).json({
        success: false,
        error: 'You already have a booking in that time slot',
      })
    }

    const appointment = new Appointment({
      customer: req.user.id,
      service,
      slot,
      scheduledAt: slot.start,
    })
    await appointment.save()
    return res.status(201).json({ success: true, appointment })
  } catch (err) {
    console.error('Book appointment error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   GET /api/appointments
// @desc    List appointments for logged-in user
// @access  Private (user)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Appointment.find({ customer: req.user.id })
      .populate('service')
      .populate('customer', 'name email')
    return res.json({ success: true, bookings })
  } catch (err) {
    console.error('Get my bookings error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   GET /api/appointments/admin
// @desc    List all appointments (admin)
// @access  Private (admin)
export const getAllBookings = async (req, res) => {
  try {
    // 1) load all appointments with service + customer
    const all = await Appointment.find()
      .populate('service')
      .populate('customer', 'name email')

    // 2) filter to only those whose service.admin matches this admin
    const mine = all.filter((b) => {
      return b.service && b.service.admin.toString() === req.user.id
    })

    return res.json({ success: true, bookings: mine })
  } catch (err) {
    console.error('Get all bookings error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}


// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (admin)
// @access  Private (admin)
export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body
  if (!['pending', 'confirmed', 'declined', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' })
  }

  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!appt) {
      return res
        .status(404)
        .json({ success: false, error: 'Appointment not found' })
    }
    return res.json({ success: true, appointment: appt })
  } catch (err) {
    console.error('Update status error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment (user)
// @access  Private (user)
export const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id },
      { status: 'cancelled' },
      { new: true }
    )
    if (!appt) {
      return res
        .status(404)
        .json({ success: false, error: 'Appointment not found or not yours' })
    }
    return res.json({ success: true, appointment: appt })
  } catch (err) {
    console.error('Cancel appointment error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
