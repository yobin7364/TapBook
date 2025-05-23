import Appointment from '../models/Appointment.module.js'
import Service from '../models/Service.module.js'
import { validateAppointment } from '../validator/appointment.validator.js'

// @route   POST /api/appointments
// @desc    Book a new appointment (user)
// @access  Private (user)
export const bookAppointment = async (req, res) => {
  const { errors, isValid } = validateAppointment(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  const { service, slot } = req.body
  try {
    // Ensure service exists
    const svc = await Service.findById(service)
    if (!svc) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }

    const appointment = new Appointment({
      customer: req.user.id,
      service,
      slot,
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
    const bookings = await Appointment.find()
      .populate('service')
      .populate('customer', 'name email')
    return res.json({ success: true, bookings })
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
