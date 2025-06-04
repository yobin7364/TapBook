// controllers/timeSlot.controller.js

import Appointment from '../models/Appointment.module.js'
import Service from '../models/Service.module.js'
import { DateTime } from 'luxon'
export const getAvailableSlots = async (req, res) => {
  const { id } = req.params
  const { date } = req.query // expect “YYYY-MM-DD”

  if (!date) {
    return res.status(400).json({ success: false, error: 'Date is required' })
  }

  // 1) EARLY OUT FOR “date < today”
  const todayISO = new Date().toISOString().slice(0, 10) // e.g. "2025-06-03"
  if (date < todayISO) {
    return res.json({ success: true, slots: [] })
  }

  // 2) LOAD SERVICE
  const svc = await Service.findById(id)
  if (!svc) {
    return res.status(404).json({ success: false, error: 'Service not found' })
  }

  // 3) FIGURE OUT THE WEEKDAY NAME (in UTC) FOR your “date” STRING
  //     (“Wed” for 2025-06-04)
  const weekdayName = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  })


  // 4) PULL OUT THE HOURS FOR THAT WEEKDAY
  //    Note: businessHours is stored in Mongo as a plain object (not a Map),
  //    so use bracket notation, not .get(...)

  const hours = svc.businessHours.get(weekdayName)

  if (!hours || hours.closed) {

    return res.json({ success: true, slots: [] })
  }

  // 5) DURATION IN MILLISECONDS
  const slotDuration = svc.duration * 60_000

  // 6) SPLIT HOURS INTO [HH,MM,SS]
  const [hFrom, mFrom, sFrom] = hours.from
    .split(':')
    .map((x) => parseInt(x, 10))
  const [hTo, mTo, sTo] = hours.to.split(':').map((x) => parseInt(x, 10))
  // 7) BUILD A Luxon DATETIME IN “Australia/Sydney”
  //     (e.g. “2025-06-04T10:00:00” in Sydney local time)
  const openingDT = DateTime.fromObject(
    {
      year: parseInt(date.slice(0, 4), 10),
      month: parseInt(date.slice(5, 7), 10),
      day: parseInt(date.slice(8, 10), 10),
      hour: hFrom,
      minute: mFrom,
      second: sFrom,
    },
    { zone: 'Australia/Sydney' }
  )
  const closingDT = DateTime.fromObject(
    {
      year: parseInt(date.slice(0, 4), 10),
      month: parseInt(date.slice(5, 7), 10),
      day: parseInt(date.slice(8, 10), 10),
      hour: hTo,
      minute: mTo,
      second: sTo,
    },
    { zone: 'Australia/Sydney' }
  )

  // 8) CONVERT “Sydney local” → UTC
  const openingUTC = openingDT.toUTC().toJSDate()
  const closingUTC = closingDT.toUTC().toJSDate()

  // If openingUTC ≥ closingUTC, that’s a red flag (no slots)
  if (openingUTC.getTime() >= closingUTC.getTime()) {
    return res.json({ success: true, slots: [] })
  }

  // 9) BUILD “ALL POSSIBLE” SLOT START TIMES BETWEEN openingUTC AND closingUTC
  const allSlots = []
  let cursor = new Date(openingUTC)
  while (cursor.getTime() + slotDuration <= closingUTC.getTime()) {
    allSlots.push(new Date(cursor))
    cursor = new Date(cursor.getTime() + slotDuration)
  }



  // 10) IF date === today, FILTER OUT PAST TIMES
  let candidateSlots = allSlots
  if (date === todayISO) {
    const now = new Date()
    candidateSlots = allSlots.filter((dt) => dt.getTime() > now.getTime())

  }

  // 11) EXCLUDE ALREADY BOOKED SLOTS ON THAT UTC DAY
  const dayStartUTC = DateTime.fromISO(`${date}T00:00:00`, {
    zone: 'UTC',
  }).toJSDate()
  const dayEndUTC = DateTime.fromISO(`${date}T23:59:59`, {
    zone: 'UTC',
  }).toJSDate()

  const booked = await Appointment.find({
    service: id,
    'slot.start': { $gte: dayStartUTC, $lte: dayEndUTC },
    status: { $in: ['pending', 'confirmed'] },
  })
  const bookedTimes = new Set(booked.map((a) => a.slot.start.toISOString()))



  const slots = candidateSlots.map((dt) => ({
    start: dt.toISOString(),
    available: !bookedTimes.has(dt.toISOString()),
  }))


  return res.json({ success: true, slots })
}