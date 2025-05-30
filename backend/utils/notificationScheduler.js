// backend/utils/notificationScheduler.js

import cron from 'node-cron'
import mongoose from 'mongoose'
import Appointment from '../models/Appointment.module.js'
import User from '../models/User.module.js'
import Service from '../models/Service.module.js'
import { sendEmail } from './mailer.js'
import keys from '../config/keys.config.js'

console.log('⏰ Notification scheduler loaded and will run every minute')

cron.schedule('* * * * *', async () => {
  // format in Australia/Sydney local time
  const nowLocal = new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    hour12: false,
  })
  console.log('⏰ Reminder cron tick at (local):', nowLocal)

  try {
    // DEBUG: compute exactly what window we’re scanning
    const cutoff = new Date(Date.now() + keys.REMINDER_BEFORE_HOURS * 3600_000)
    const nextHour = new Date(cutoff.getTime() + 3600_000)
    console.log(
      '    looking for appts with scheduledAt ≥',
      cutoff.toISOString(),
      'and <',
      nextHour.toISOString()
    )

    // Find appointments in (REMINDER_BEFORE_HOURS ±1h) window, not yet reminded
    const appts = await Appointment.find({
      status: 'confirmed',
      scheduledAt: { $gte: cutoff, $lt: nextHour },
      reminded: { $ne: true },
    })
      .populate('customer', 'email name')
      .populate('service', 'serviceName')

    // DEBUG: how many did we find?
    console.log('    → found', appts.length, 'appointment(s) to remind')

    for (let appt of appts) {
      // DEBUG: log each one
      console.log(
        '    🔔 reminding',
        appt.customer.email,
        'for appointment',
        appt._id,
        'at',
        appt.scheduledAt.toISOString()
      )

      // Send reminder email
      await sendEmail({
        to: appt.customer.email,
        subject: `Reminder: Upcoming appointment for ${appt.service.serviceName}`,
        text: `Hi ${
          appt.customer.name
        },\n\nThis is a reminder for your upcoming "${
          appt.service.serviceName
        }" booking on ${appt.scheduledAt.toLocaleString('en-AU', {
          timeZone: 'Australia/Sydney',
          hour12: false,
        })}.\n\nSee you then!\n—TapBook`,
      })

      // Mark as reminded
      appt.reminded = true
      await appt.save()
    }
  } catch (err) {
    console.error('Reminder scheduler error:', err)
  }
})
