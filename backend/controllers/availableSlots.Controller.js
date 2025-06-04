// controllers/timeSlot.controller.js

import Appointment from '../models/Appointment.module.js'
import Service from '../models/Service.module.js'

export const getAvailableSlots = async (req, res) => {
  const { id } = req.params
  const { date } = req.query // “YYYY-MM-DD”

  if (!date) {
    return res.status(400).json({ success: false, error: 'Date is required' })
  }

  // ─── 1) EARLY OUT FOR “date < today” ───
  // Compare ISO‐date strings so we don’t have to worry about hours/minutes.
  // e.g. if today is 2025-06-03 (AEST), new Date().toISOString().slice(0,10) === "2025-06-03"
  const todayISO = new Date().toISOString().slice(0, 10)
  if (date < todayISO) {
    // requested day is strictly before today → no slots
    return res.json({ success: true, slots: [] })
  }

  const svc = await Service.findById(id)
  if (!svc) {
    return res.status(404).json({ success: false, error: 'Service not found' })
  }

  // ─── 2) DETERMINE BUSINESS HOURS FOR THAT DATE ───
  // Compute weekday name in UTC so it matches how you've stored businessHours as a Map<"Monday", {…}>
  const weekdayName = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  })

  const hours = svc.businessHours.get(weekdayName)
  if (!hours || hours.closed) {
    return res.json({ success: true, slots: [] })
  }

  // Duration (ms)
  const slotDuration = svc.duration * 60_000

  // Note: We still build openingUTC/closingUTC by appending “Z” because hours.from/to
  // are meant to be UTC‐strings (e.g. "08:30:00" means 08:30 UTC). If your
  // businessHours.from/to are actually in AEST, you’d need a different approach—but
  // this example assumes “from” and “to” are stored as UTC.
  const openingUTC = new Date(`${date}T${hours.from}Z`)
  const closingUTC = new Date(`${date}T${hours.to}Z`)

  // ─── 3) GENERATE EVERY SLOT BETWEEN openingUTC AND closingUTC ───
  const allSlots = []
  let cursor = new Date(openingUTC)
  while (cursor.getTime() + slotDuration <= closingUTC.getTime()) {
    allSlots.push(new Date(cursor))
    cursor = new Date(cursor.getTime() + slotDuration)
  }

  // ─── 4) IF “date === today”, FILTER OUT PAST TIMES ───
  let candidateSlots = allSlots
  if (date === todayISO) {
    const now = new Date()
    candidateSlots = allSlots.filter((dt) => dt.getTime() > now.getTime())
  }
  // If date > todayISO, keep allSlots as is (future date)

  // ─── 5) EXCLUDE ANY SLOTS THAT ARE ALREADY BOOKED ───
  const dayStartUTC = new Date(`${date}T00:00:00Z`)
  const dayEndUTC = new Date(`${date}T23:59:59Z`)

  const booked = await Appointment.find({
    service: id,
    'slot.start': { $gte: dayStartUTC, $lt: dayEndUTC },
    status: { $in: ['pending', 'confirmed'] },
  })

  const bookedTimes = booked.map((a) => a.slot.start.toISOString())

  const slots = candidateSlots.map((dt) => ({
    start: dt.toISOString(),
    available: !bookedTimes.includes(dt.toISOString()),
  }))

  return res.json({ success: true, slots })
}
