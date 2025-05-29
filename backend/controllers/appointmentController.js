import Appointment from '../models/Appointment.module.js'
import Service from '../models/Service.module.js'
import { validateAppointment } from '../validator/appointment.validator.js'
import User from '../models/User.module.js'
import { getAppointmentSummaryData } from '../utils/appointment.utils.js'
import { sendEmail } from '../utils/mailer.js' // or wherever your mailer is

// @route   POST /api/appointments
// @desc    Book a new appointment (user)
// @access  Private (user)
export const bookAppointment = async (req, res) => {
  const { errors, isValid } = validateAppointment(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  const { service, slot, mobile, note } = req.body

  // --- NEW: Prevent booking in the past ---
  const now = new Date()
  const start = new Date(slot.start)
  const end = new Date(slot.end)
  if (start < now) {
    return res.status(400).json({
      success: false,
      error: 'Cannot book an appointment in the past'
    })
  }
  // --- END NEW ---

  try {
    // 1. DRY: Get price summary and business hour validation
    const {
      service: svc,
      summary,
      error,
    } = await getAppointmentSummaryData({
      userId: req.user.id,
      serviceId: service,
      slot,
    })
    if (error) {
      return res.status(400).json({ success: false, error })
    }

    // 2. Prevent double-booking the same provider
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

    // 3. Prevent user from double-booking themselves
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

    // 4. Save appointment
    const appointment = new Appointment({
      customer: req.user.id,
      service,
      slot,
      scheduledAt: slot.start,
      mobile: mobile || '',
      note: note || '',
      status: 'pending',
    })
    await appointment.save()
    return res.status(201).json({
      success: true,
      appointment,
      summary, // Contains {serviceCost, membershipDiscount, totalDue}
    })
  } catch (err) {
    console.error('Book appointment error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   POST /api/appointments/summary
// @desc    Preview booking cost and discount (does NOT save)
// @access  Private (user)
export const previewAppointment = async (req, res) => {
  const { service, slot } = req.body
  if (!service || !slot || !slot.start || !slot.end) {
    return res
      .status(400)
      .json({ success: false, error: 'Missing service or slot info' })
  }

  try {
    const { summary, error } = await getAppointmentSummaryData({
      userId: req.user.id,
      serviceId: service,
      slot,
    })
    if (error) {
      return res.status(400).json({ success: false, error })
    }
    return res.json({ success: true, summary })
  } catch (err) {
    console.error('Preview appointment error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}



// @route   GET /api/appointments
// @desc    List appointments for logged-in user
// @access  Private (user)
export const getMyBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
  try {
  const [bookings, total] = await Promise.all([
    Appointment.find({ customer: req.user.id })
      .populate('service')
      .populate('customer', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Appointment.countDocuments({ customer: req.user.id }),
  ])
    
    return res.json({
      success: true,
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get my bookings error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
// @route   GET /api/appointments/admin
// @desc    List all appointments (admin, paginated)
// @access  Private (admin)
export const getAllBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  try {
    // Find services belonging to this admin
    const adminServices = await Service.find({ admin: req.user.id }).select('_id')
    const serviceIds = adminServices.map((svc) => svc._id)

    // Paginated appointments for this admin
    const [bookings, total] = await Promise.all([
      Appointment.find({ service: { $in: serviceIds } })
        .populate('service')
        .populate('customer', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Appointment.countDocuments({ service: { $in: serviceIds } }),
    ])

    return res.json({
      success: true,
      bookings,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get all bookings error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   GET /api/appointments/:id
// @desc    Get one appointment by ID (must be the customer or admin)
// @access  Private
export const getMyBookingById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service')
      .populate('customer', 'name email')

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      })
    }

    // Only allow if the user is the customer or the admin of the service
    const isCustomer = appointment.customer._id.equals(req.user.id)
    const isAdmin = appointment.service?.admin?.toString() === req.user.id

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this booking',
      })
    }

    return res.json({
      success: true,
      booking: appointment,
    })
  } catch (err) {
    console.error('Get one booking error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}


// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (admin)
// @access  Private (admin)
export const updateAppointmentStatus = async (req, res) => {
  const { status, cancelNote } = req.body
  if (!['confirmed', 'declined', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' })
  }

  // If cancelling or declining, require a reason
  if ((status === 'cancelled' || status === 'declined') && (!cancelNote || cancelNote.length < 3)) {
    return res.status(400).json({ success: false, error: 'Reason is required for cancellation/decline' })
  }

  try {
    const appt = await Appointment.findById(req.params.id).populate('service')
    if (!appt) {
      return res
        .status(404)
        .json({ success: false, error: 'Appointment not found' })
    }
    const service = await Service.findById(appt.service)
    if (!service || service.admin.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' })
    }
if (appt.status !== 'pending' && appt.status !== 'confirmed') {
  return res.status(400).json({
    success: false,
    error: 'Only pending appointments can be updated',
  })
}
    appt.status = status
    if (status === 'cancelled' || status === 'declined') {
      appt.cancelNote =  cancelNote
    }
    await appt.save()


    await appt.populate('customer', 'name email')

     if (status === 'declined' || status === 'cancelled') {
       await sendEmail({
         to: appt.customer.email,
         subject: `Your appointment was ${status}`,
         text: `Hi ${appt.customer.name},

Your booking for "${appt.service.title}" was ${status} by the provider.

Reason: ${cancelNote}

If you have questions, please contact support.`,
       })
     }

     return res.json({ success: true, appointment: appt })
    return res.json({ success: true, appointment: appt })
  } catch (err) {
    console.error('Update status error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
// @route   GET /api/notifications
// @desc    List upcoming appointments (for notification, paginated)
// @access  Private (user)
export const getNotifications = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  try {
    const now = new Date()

    // Total notifications count
    const total = await Appointment.countDocuments({
      customer: req.user.id,
      'slot.start': { $gte: now },
      status: { $in: ['pending', 'confirmed'] }
    })

    // Get paginated notifications
    const appointments = await Appointment.find({
      customer: req.user.id,
      'slot.start': { $gte: now },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('service', 'title')
      .sort({ 'slot.start': 1 })
      .skip(skip)
      .limit(limit)

    // Format for frontend
    const notifications = appointments.map(appt => ({
      title: appt.service?.title || 'Appointment',
      date: appt.slot.start,
      status: 'Upcoming',
      id: appt._id,
    }))

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Get notifications error:', err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}


// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment (user), with cancelNote required
// @access  Private (user)
export const cancelAppointment = async (req, res) => {
  const { cancelNote } = req.body;
  if (!cancelNote || cancelNote.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Cancellation reason is required and must be at least 3 characters.',
    });
  }

  try {
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id },
      { status: 'cancelled', cancelNote },
      { new: true }
    );
    if (!appt) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or not yours',
      });
    }
    return res.json({ success: true, appointment: appt });
  } catch (err) {
    console.error('Cancel appointment error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
