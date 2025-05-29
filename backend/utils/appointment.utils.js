// appointment.utils.js

import Service from '../models/Service.module.js'
import User from '../models/User.module.js'
import { DateTime } from 'luxon'

export async function getAppointmentSummaryData({ userId, serviceId, slot }) {
  // Find the service
  const svc = await Service.findById(serviceId)
  if (!svc) return { error: 'Service not found' }

  // Check business hours (timezone safe)
  const start = DateTime.fromISO(slot.start, { zone: 'utc' }).setZone(
    'Australia/Sydney'
  )
  const end = DateTime.fromISO(slot.end, { zone: 'utc' }).setZone(
    'Australia/Sydney'
  )

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const dayName = daysOfWeek[start.weekday % 7] // Luxon: Monday=1 ... Sunday=7

  const hours = svc.businessHours.get?.(dayName) || svc.businessHours[dayName]
  if (!hours || hours.closed)
    return { error: 'Requested day is outside provider business hours' }

  // Format as 'HH:mm'
  const startHM = start.toFormat('HH:mm')
  const endHM = end.toFormat('HH:mm')
  const openHM = hours.from.slice(0, 5)
  const closeHM = hours.to.slice(0, 5)

  if (startHM < openHM || endHM > closeHM)
    return { error: 'Requested time is outside provider business hours' }

  // Membership discount
  let membershipDiscount = 0
  let totalDue = svc.price

  const user = await User.findById(userId).lean()

  if (
    user.membership &&
    !user.membership.cancelled &&
    user.membership.expiryDate &&
    new Date(user.membership.expiryDate) > new Date()
  ) {
    if (user.membership.plan === 'yearly') {
      membershipDiscount = 0.1 * svc.price
    } else if (user.membership.plan === 'monthly') {
      membershipDiscount = 0.05 * svc.price
    }
    totalDue = svc.price - membershipDiscount
  }

  return {
    service: svc,
    summary: {
      serviceCost: svc.price,
      membershipDiscount,
      totalDue,
    },
  }
}
