// utils/appointment.utils.js

import Service from '../models/Service.module.js'
import User from '../models/User.module.js'

export async function getAppointmentSummaryData({ userId, serviceId, slot }) {
  // 1) Load service
  const svc = await Service.findById(serviceId)
  if (!svc) return { error: 'Service not found' }

  // 2) Parse start/end as UTC
  const start = new Date(slot.start)
  const end = new Date(slot.end)
  if (isNaN(start) || isNaN(end)) {
    return { error: 'Invalid slot times' }
  }

  // 3) Determine weekday name in UTC (or assume businessHours keys are in UTC weekdays)
  const dayName = start.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  })
  const hours = svc.businessHours.get
    ? svc.businessHours.get(dayName) // Map
    : svc.businessHours[dayName] // Object

  if (!hours || hours.closed) {
    return { error: 'Requested day is outside business hours' }
  }

  // 4) Check time‐of‐day against hours.from/to (both "HH:mm:ss")
  const toHM = (d) => d.toISOString().slice(11, 16) // "HH:mm"
  const startHM = toHM(start)
  const endHM = toHM(end)
  const openHM = hours.from.slice(0, 5)
  const closeHM = hours.to.slice(0, 5)
  if (startHM < openHM || endHM > closeHM) {
    return { error: 'Requested time is outside business hours' }
  }

  // 5) Compute discount
  const user = await User.findById(userId).lean()
  const now = new Date()
  let membershipDiscount = 0
  if (
    user.membership &&
    !user.membership.cancelled &&
    user.membership.expiryDate &&
    new Date(user.membership.expiryDate) > now
  ) {
    const rate = user.membership.plan === 'yearly' ? 0.1 : 0.05
    membershipDiscount = svc.price * rate
  }

  const serviceCost = svc.price
  const totalDue = serviceCost - membershipDiscount

  return {
    service: svc,
    summary: { serviceCost, membershipDiscount, totalDue },
  }
}
