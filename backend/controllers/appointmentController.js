import Appointment from '../models/Appointment.module.js'
import Service from '../models/Service.module.js'
import { validateAppointment } from '../validator/appointment.validator.js'
import User from '../models/User.module.js'
import { getAppointmentSummaryData } from '../utils/appointment.utils.js'
import { sendEmail } from '../utils/mailer.js' 
import Review from '../models/Review.module.js'
import Notification from '../models/Notification.module.js'
import { DateTime } from 'luxon'


// @route   POST /api/appointments
// @desc    Book a new appointment (user)
// @access  Private (user)

export const bookAppointment = async (req, res) => {
  const { name, service: serviceId, start, mobile, note } = req.body

  // 1) Parse the incoming “start” as a JS Date (UTC)
  const startDate = new Date(start)
  const now = new Date()

  if (isNaN(startDate)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid start date',
    })
  }
  if (startDate < now) {
    return res.status(400).json({
      success: false,
      error: 'Cannot book an appointment in the past',
    })
  }

  try {
    // 2) Load service to get duration + businessHours
    const svc = await Service.findById(serviceId)
    if (!svc) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }

    // 3) CONVERT “startDate” (UTC) → Sydney local so we can pick the weekday
    const localDT = DateTime.fromJSDate(startDate, { zone: 'Australia/Sydney' })
    const weekdayName = localDT.toLocaleString({ weekday: 'long' }) // e.g. "Wednesday"

    // 4) Fetch that day’s businessHours from the Map
    const hours = svc.businessHours.get(weekdayName)
    if (!hours || hours.closed) {
      return res
        .status(400)
        .json({ success: false, error: 'Service is closed on that day' })
    }

    // 5) Parse hours.from/to (HH:mm:ss) into Sydney-local DateTimes on the same date
    const [hFrom, mFrom, sFrom] = hours.from
      .split(':')
      .map((x) => parseInt(x, 10))
    const [hTo, mTo, sTo] = hours.to.split(':').map((x) => parseInt(x, 10))

    const year = localDT.year
    const month = localDT.month
    const day = localDT.day

    // Opening at, say, 10:00 Sydney → that in UTC is openingUTC
    const openingDT = DateTime.fromObject(
      { year, month, day, hour: hFrom, minute: mFrom, second: sFrom },
      { zone: 'Australia/Sydney' }
    )
    const closingDT = DateTime.fromObject(
      { year, month, day, hour: hTo, minute: mTo, second: sTo },
      { zone: 'Australia/Sydney' }
    )

    const openingUTC = openingDT.toUTC().toJSDate()
    const closingUTC = closingDT.toUTC().toJSDate()

    // 6) If startDate (UTC) is before opening or ≥ closing, reject
    if (startDate < openingUTC || startDate >= closingUTC) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Requested time is outside business hours',
        })
    }

    // 7) Compute endDate based on service duration (in minutes)
    const endDate = new Date(startDate.getTime() + svc.duration * 60000)
    const slot = { start: startDate, end: endDate }

    // 8) Prevent double‐booking the same provider
    const conflict = await Appointment.findOne({
      service: serviceId,
      status: { $in: ['pending', 'confirmed'] },
      'slot.start': { $lt: endDate },
      'slot.end': { $gt: startDate },
    })
    if (conflict) {
      return res.status(400).json({
        success: false,
        error: 'This time slot is already booked',
      })
    }

    // 9) Prevent user from double‐booking themselves
    const selfConflict = await Appointment.findOne({
      customer: req.user.id,
      status: { $in: ['pending', 'confirmed'] },
      'slot.start': { $lt: endDate },
      'slot.end': { $gt: startDate },
    })
    if (selfConflict) {
      return res.status(400).json({
        success: false,
        error: 'You already have a booking in that time slot',
      })
    }

    // 10) Compute average service rating (for returned payload)
    const stats = await Review.aggregate([
      { $match: { service: svc._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ])
    const avgRating = stats[0]?.avgRating ?? 0

    // 11) Fetch admin name
    const adminUser = await User.findById(svc.admin).select('name').lean()
    const adminName = adminUser?.name || 'Unknown'

    // 12) Calculate payment summary (you had getAppointmentSummaryData; we'll assume it just returns cost fields)
    //     If you still want to use it, you can—but it should not re‐validate business hours.
    //     Here’s a quick manual fallback if you want to compute basic cost + discount:
    let serviceCost = svc.price
    let membershipDiscount = 0
    let totalDue = serviceCost

    // If you rely entirely on getAppointmentSummaryData, uncomment and use below:
    /*
    const { summary, error } = await getAppointmentSummaryData({
      userId: req.user.id,
      serviceId: serviceId,
      slot,
    })
    if (error) {
      return res.status(400).json({ success: false, error })
    }
    serviceCost = summary.serviceCost
    membershipDiscount = summary.membershipDiscount
    totalDue = summary.totalDue
    */

    // 13) Create and save the appointment
    const appointment = new Appointment({
      customer: req.user.id,
      customerName: name,
      service: serviceId,
      slot,
      scheduledAt: startDate,
      mobile,
      note: note || '',
      status: 'pending',
      payment: {
        serviceCost,
        membershipDiscount,
        totalDue,
      },
    })
    await appointment.save()

    // 14) Create notification for the user
    await Notification.create({
      user: req.user.id,
      type: 'status',
      message: `Your appointment for "${
        svc.serviceName || svc.category
      }" is now pending.`,
      appointment: appointment._id,
      read: false,
      createdAt: new Date(),
    })

    // 15) Return the newly‐created appointment + extra data
    return res.status(201).json({
      success: serviceCost !== undefined, // or true
      appointment,
      serviceCost,
      membershipDiscount,
      totalDue,
      serviceAddress: svc.address,
      avgRating,
      adminName,
    })
  } catch (err) {
    console.error('Book appointment error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   PUT /api/appointments/:id
// @desc    Edit an existing appointment (user)
// @access  Private (user)
export const updateAppointment = async (req, res) => {
  const { name, start, mobile, note } = req.body

  // Require at least one field to update
  if (!name && !start && !mobile && !note) {
    return res.status(400).json({
      success: false,
      error: 'Provide at least one of name, start, mobile, or note to update'
    })
  }

  try {
    // Load appointment and ensure it's this user's
    const appt = await Appointment.findById(req.params.id)
    if (!appt || appt.customer.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Appointment not found' })
    }

    // Only allow editing if still pending or confirmed
    if (!['pending','confirmed'].includes(appt.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot edit a cancelled, declined, or completed appointment'
      })
    }

    let slot               = appt.slot
    let serviceCost        = appt.payment.serviceCost
    let membershipDiscount = appt.payment.membershipDiscount
    let totalDue           = appt.payment.totalDue
    let svc                // will be assigned if start changes

    //If start is changing, re‐validate slot & recalc payment
    if (start) {
      const startDate = new Date(start)
      if (isNaN(startDate)) {
        return res.status(400).json({ success: false, error: 'Invalid start date' })
      }
      const now = new Date()
      if (startDate < now) {
        return res.status(400).json({ success: false, error: 'Cannot reschedule into the past' })
      }

      // load service to get duration
      svc = await Service.findById(appt.service)
      if (!svc) {
        return res.status(404).json({ success: false, error: 'Service not found' })
      }

      const endDate = new Date(startDate.getTime() + svc.duration * 60000)
      const newSlot = { start: startDate, end: endDate }

      // business‐hours & cost summary
      const { summary, error } = await getAppointmentSummaryData({
        userId:    req.user.id,
        serviceId: svc._id.toString(),
        slot:      newSlot
      })
      if (error) {
        return res.status(400).json({ success: false, error })
      }

      ({ serviceCost, membershipDiscount, totalDue } = summary)
      slot             = newSlot
      appt.scheduledAt = startDate
    }

    // Prevent double‐booking same provider (only if start changed)
    if (start) {
      const conflict = await Appointment.findOne({
        _id: { $ne: appt._id },
        service: appt.service,
        status: { $in: ['pending','confirmed'] },
        'slot.start': { $lt: slot.end },
        'slot.end':   { $gt: slot.start }
      })
      if (conflict) {
        return res.status(400).json({ success: false, error: 'Time slot already booked' })
      }
      const selfConflict = await Appointment.findOne({
        _id: { $ne: appt._id },
        customer: req.user.id,
        status:   { $in: ['pending','confirmed'] },
        'slot.start': { $lt: slot.end },
        'slot.end':   { $gt: slot.start }
      })
      if (selfConflict) {
        return res.status(400).json({ success: false, error: 'You already have a booking at this time' })
      }
    }

    // Apply other updates
    if (name)   appt.customerName = name
    if (mobile) appt.mobile       = mobile
    if (note)   appt.note         = note
    if (start)  appt.slot         = slot

    // Update payment if slot changed
    if (start) {
      appt.payment = { serviceCost, membershipDiscount, totalDue }
    }

    // Save the appointment
    await appt.save()

    // If start was changed, create a “rescheduled” notification
    if (start && svc) {
      const serviceName = svc.serviceName || svc.category || 'your service'
      await Notification.create({
        user:        req.user.id,
        type:        'status',  // or 'reschedule' if you prefer
        message:     `Your appointment for "${serviceName}" was rescheduled.`,
        appointment: appt._id,
        read:        false,
        createdAt:   new Date()
      })
    }

    // Fetch updated avgRating, adminName, address for response
    const svcForReturn = svc ?? (await Service.findById(appt.service))
    const stats = await Review.aggregate([
      { $match: { service: svcForReturn._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ])
    const avgRating = stats[0]?.avgRating ?? 0
    const adminUser = await User.findById(svcForReturn.admin).select('name').lean()
    const adminName = adminUser?.name || 'Unknown'

    // Return updated appointment + related info
    return res.json({
      success:        true,
      appointment:    appt,
      serviceCost,
      membershipDiscount,
      totalDue,
      serviceAddress: svcForReturn.address,
      avgRating,
      adminName
    })
  } catch (err) {
    console.error('Update appointment error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
// @route   GET /api/appointments/past
// @desc    List all past (completed) appointments for the user
// @access  Private (user)
export const getPastAppointments = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1,  1)
    const limit = Math.max(parseInt(req.query.limit) || 10, 1)
    const skip  = (page - 1) * limit
    const now   = new Date()

    // 1) total count of past‐completed appointments
    const total = await Appointment.countDocuments({
      customer:   req.user.id,
      status:     'completed',           // only completed
    })

    // 2) fetch one page of those past‐completed appointments
    const past = await Appointment.find({
      customer: req.user.id,
      status: 'completed',
    })
      .sort({ 'slot.start': -1 }) // most recent first
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name email') // if you still want the customer info
      .populate({
        path: 'service',
        select: 'serviceName category price duration address admin',
        populate: {
          path: 'admin',
          select: 'name',
        },
      })
    return res.json({
      success: true,
      past,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (err) {
    console.error('Get past appointments error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}



// @route   GET /api/appointments/upcoming
// @desc    List all future (pending/confirmed) appointments for the user
// @access  Private (user)
export const getUpcomingAppointments = async (req, res) => {
  try {
    const now = new Date()
    const upcoming = await Appointment.find({
      customer: req.user.id,
      'slot.start': { $gte: now },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate({
        path: 'service',
        select: 'serviceName category price duration address admin',
        populate: { path: 'admin', select: 'name' },
      })
      .populate('customer', 'name email')
      .sort({ 'slot.start': 1 })
    return res.json({ success: true, upcoming })
  } catch (err) {
    console.error('Get upcoming error:', err)
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
    error: 'Only pending  or confirmed appointments can be updated',
  })
}
    appt.status = status
    if (status === 'cancelled' || status === 'declined') {
      appt.cancelNote =  cancelNote
    }
    await appt.save()


// record an in-app notification
await Notification.create({
   user:        appt.customer._id,
   type:        'status',
   message:     `Your appointment for "${appt.service.serviceName}" was ${status}.`,
   appointment: appt._id
 })

    await appt.populate('customer', 'name email')

     if (status === 'declined' || status === 'cancelled') {
       await sendEmail({
         to: appt.customer.email,
         subject: `Your appointment was ${status}`,
         text: `Hi ${appt.customer.name},

Your booking for "${appt.service.serviceName}" was ${status} by the provider.

Reason: ${cancelNote}

If you have questions, please contact support.`,
       })
     }

    return res.json({ success: true, appointment: appt })
  } catch (err) {
    console.error('Update status error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   GET /api/notifications
// @desc    List user notifications 
// @access  Private (user)
export const getNotifications = async (req, res) => {
  
  const page  = Math.max(parseInt(req.query.page)  || 1, 1)
  const limit = Math.max(parseInt(req.query.limit) || 10, 1)
  const skip  = (page - 1) * limit

  try {
    // 1) total count
    const total = await Notification.countDocuments({ user: req.user.id })

    // 2) fetch page, populating appointment → service → admin
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
        }
      })
      .lean()

    // 3) shape for front‐end
    const notifications = notes.map((n) => {
      // appointment might be null (e.g. a reminder without appointment), so guard
      const appt = n.appointment || {}
      const svc  = appt.service    || {}
      const adm  = svc.admin       || {}

      return {
        id:           n._id,
        type:         n.type,  
        message:      n.message,
        appointment:  appt._id || null,  // appointment ID, if any
        status:       appt.status || null,   // appointment status: "confirmed", "cancelled", etc.
        serviceName:  svc.serviceName || null,
        categoryName: svc.category    || null,
        adminName:    adm.name        || null,
        read:         n.read,
        date:         n.createdAt
      }
    })

    return res.json({
      success:       true,
      notifications,
      pagination: {
        total,
        page,
        pages:  Math.ceil(total / limit),
        limit
      }
    })
  } catch (err) {
    console.error('Get notifications error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment by user with cancelNote required
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
    ).populate('service', 'serviceName') 
    console.log('POPULATED SERVICE:', appt.service)
 
    if (!appt) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or not yours',
      })
    }
    // record a cancellation notification for the user
    await Notification.create({
      user: appt.customer,
      type: 'status',
      message: `Your appointment for "${
        appt.service.serviceName 
      }" was cancelled.`,
      appointment: appt._id,
      read: false,
    })
    return res.json({ success: true, appointment: appt })
  } catch (err) {
    console.error('Cancel appointment error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
