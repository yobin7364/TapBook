// controllers/timeSlot.controller.js

import Appointment from '../models/Appointment.module.js'
import Service from '../models/Service.module.js'
import { DateTime } from 'luxon'

export const getAvailableSlots = async (req, res) => {
  const { id } = req.params
  const { date } = req.query // expects "YYYY-MM-DD"

  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Date is required (YYYY-MM-DD)',
    })
  }

  // 1) Load the service
  const service = await Service.findById(id)
  if (!service) {
    return res.status(404).json({ success: false, error: 'Service not found' })
  }

  // 2) Determine the weekday name in Australia/Sydney
  const dayName = DateTime.fromISO(date, { zone: 'Australia/Sydney' }).toFormat(
    'EEEE'
  ) // e.g. "Monday"

  // 3) Grab the business hours for that day
  const hours =
    service.businessHours.get?.(dayName) || service.businessHours[dayName]
  if (!hours || hours.closed) {
    // closed all day
    return res.json({ success: true, slots: [] })
  }

  // 4) Build the list of ALL possible slot start‐times in local zone
  const opening = DateTime.fromISO(`${date}T${hours.from}`, {
    zone: 'Australia/Sydney',
  })
  const closing = DateTime.fromISO(`${date}T${hours.to}`, {
    zone: 'Australia/Sydney',
  })
  const slotDuration = service.duration // in minutes

  let cursor = opening
  const allSlots = []
  while (cursor.plus({ minutes: slotDuration }) <= closing) {
    allSlots.push(cursor.toFormat('HH:mm'))
    cursor = cursor.plus({ minutes: slotDuration })
  }

  // 5) Fetch booked appointments for that service/day in UTC range
  const dayStartUTC = opening.startOf('day').toUTC().toJSDate()
  const dayEndUTC = opening.endOf('day').toUTC().toJSDate()
  const booked = await Appointment.find({
    service: id,
    'slot.start': { $gte: dayStartUTC, $lt: dayEndUTC },
    status: { $in: ['pending', 'confirmed'] },
  })

  // 6) Map booked appointments to local "HH:mm" strings
  const bookedTimes = booked.map((appt) =>
    DateTime.fromJSDate(appt.slot.start, { zone: 'utc' })
      .setZone('Australia/Sydney')
      .toFormat('HH:mm')
  )

  // 7) Merge into final array with availability flags
  const slots = allSlots.map((time) => ({
    time,
    available: !bookedTimes.includes(time),
  }))

  return res.json({ success: true, slots })
}
