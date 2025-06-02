// controllers/timeSlot.controller.js

import Appointment from '../models/Appointment.module.js'
import Service from '../models/Service.module.js'

export const getAvailableSlots = async (req, res) => {
  const { id } = req.params
  const { date } = req.query // “YYYY-MM-DD”

  if (!date) {
    return res.status(400).json({ success: false, error: 'Date is required' })
  }

  // 1) Load service
  const svc = await Service.findById(id)
  if (!svc) {
    return res.status(404).json({ success: false, error: 'Service not found' })
  }

  // 2) Compute weekday name in UTC
  const weekdayName = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  })

  // 3) Access businessHours via Map.get()
  const hours = svc.businessHours.get(weekdayName)

  if (!hours || hours.closed) {
    return res.json({ success: true, slots: [] })
  }

  const slotDuration = svc.duration * 60000 // ms
  const openingUTC = new Date(`${date}T${hours.from}Z`)
  const closingUTC = new Date(`${date}T${hours.to}Z`)

  // 3) Build all possible UTC‐based Date slots
  const allSlots = []
  let cursor = new Date(openingUTC)
  while (cursor.getTime() + slotDuration <= closingUTC.getTime()) {
    allSlots.push(new Date(cursor))
    cursor = new Date(cursor.getTime() + slotDuration)
  }

  // 4) Fetch booked in UTC range
  const dayStartUTC = new Date(`${date}T00:00:00Z`)
  const dayEndUTC = new Date(`${date}T23:59:59Z`)

  const booked = await Appointment.find({
    service: id,
    'slot.start': { $gte: dayStartUTC, $lt: dayEndUTC },
    status: { $in: ['pending', 'confirmed'] },
  })



  // 5) Build result: each slot as ISO in UTC
  const bookedTimes = booked.map((a) => a.slot.start.toISOString())

  const slots = allSlots.map((dt) => ({
    start: dt.toISOString(),
    available: !bookedTimes.includes(dt.toISOString()),
  }))
  const availableCount = slots.filter((s) => s.available).length

  return res.json({ success: true, slots })
}
