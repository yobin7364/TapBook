import Service from '../models/Service.module.js'
import Appointment from '../models/Appointment.module.js'

// @route   GET /api/services/:id/available-slots?date=YYYY-MM-DD
// @desc    Get available appointment slots for a service on a specific date
// @access  Public (or Private, your choice)
export const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params
    const { date } = req.query // "YYYY-MM-DD"

    if (!date) {
      return res
        .status(400)
        .json({ success: false, error: 'Date is required (YYYY-MM-DD)' })
    }

    const service = await Service.findById(id)
    if (!service) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }

    // Get business hours for that weekday
    const dayName = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
    })
    const hours =
      service.businessHours.get?.(dayName) || service.businessHours[dayName] // Map or object

    if (!hours || hours.closed) {
      return res.json({ success: true, slots: [] }) // No slots if closed
    }

    // Calculate all slots for this day based on service duration
    const [fromH, fromM] = hours.from.split(':').map(Number)
    const [toH, toM] = hours.to.split(':').map(Number)
    const slotDuration = service.duration // in minutes

    let slots = []
    let current = new Date(`${date}T${hours.from}`)
    const end = new Date(`${date}T${hours.to}`)
    while (current.getTime() + slotDuration * 60000 <= end.getTime()) {
      slots.push(current.toTimeString().slice(0, 5)) // "HH:mm"
      current = new Date(current.getTime() + slotDuration * 60000)
    }

    // Find booked slots for this day
    const dayStart = new Date(`${date}T00:00:00`)
    const dayEnd = new Date(`${date}T23:59:59.999`)
    const booked = await Appointment.find({
      service: service._id,
      'slot.start': { $gte: dayStart, $lt: dayEnd },
      status: { $in: ['pending', 'confirmed'] },
    })

    const bookedTimes = booked.map((a) =>
      a.slot.start.toTimeString().slice(0, 5)
    )
    const availableSlots = slots.filter((time) => !bookedTimes.includes(time))

    return res.json({ success: true, slots: availableSlots })
  } catch (err) {
    console.error('Get available slots error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
