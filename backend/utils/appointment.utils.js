// utils/appointment.utils.js

import Service from '../models/Service.module.js'
import User from '../models/User.module.js'
import { DateTime } from 'luxon'

export async function getAppointmentSummaryData({ userId, serviceId, slot }) {
  // 1) Load the service
  const svc = await Service.findById(serviceId)
  if (!svc) {
    return { error: 'Service not found' }
  }

  // 2) Parse start/end into Luxon DateTimes
  const toDateTime = (v) =>
    v instanceof Date
      ? DateTime.fromJSDate(v, { zone: 'utc' })
      : DateTime.fromISO(v, { zone: 'utc' })

  const startDT = toDateTime(slot.start)
  const endDT = toDateTime(slot.end)

  // 3) Convert to Australia/Sydney
  const start = startDT.setZone('Australia/Sydney')
  const end = endDT.setZone('Australia/Sydney')

  // 4) Determine weekday name
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  // Luxon.weekday: 1=Monday … 7=Sunday
  const dayName = daysOfWeek[start.weekday % 7]

  // 5) Access the hours correctly
  let hours
  if (typeof svc.businessHours.get === 'function') {
    // Mongoose Map
    hours = svc.businessHours.get(dayName)
  } else {
    // Plain object
    hours = svc.businessHours[dayName]
  }

  if (!hours || hours.closed) {
    return { error: 'Requested day is outside provider business hours' }
  }

  // 6) Check time‐of‐day within open/close
  const fmt = (dt) => dt.toFormat('HH:mm')
  const startHM = fmt(start)
  const endHM = fmt(end)
  const openHM = hours.from.slice(0, 5)
  const closeHM = hours.to.slice(0, 5)

  if (startHM < openHM || endHM > closeHM) {
    return { error: 'Requested time is outside provider business hours' }
  }

  // 7) Compute membership discount
  const user = await User.findById(userId).lean()
  const now = new Date()
  let membershipDiscount = 0

  if (
    user.membership &&
    !user.membership.cancelled &&
    user.membership.expiryDate &&
    new Date(user.membership.expiryDate) > now
  ) {
    const RATES = { monthly: 0.05, yearly: 0.1 }
    const rate = RATES[user.membership.plan] || 0
    membershipDiscount = svc.price * rate
  }

  const serviceCost = svc.price
  const totalDue = serviceCost - membershipDiscount

  // 8) Return full data
  return {
    service: svc,
    summary: { serviceCost, membershipDiscount, totalDue },
  }
}
