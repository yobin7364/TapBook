// seedData/seedData.js

import Service from '../models/Service.module.js'
import Appointment from '../models/Appointment.module.js'
import { faker } from '@faker-js/faker'

// Accept an object with adminIds and customerIds
export async function seedData({ adminIds, customerIds }) {
  try {
    // 1) Clear existing Services and Appointments
    await Service.deleteMany({})
    await Appointment.deleteMany({})
    console.log('✅ [seedData] Cleared Service and Appointment collections.')

    // 2) Create one Service per admin
    const serviceDocs = []
    for (const adminId of adminIds) {
      const serviceName = faker.commerce.productName()
      // Use faker.number.int instead of faker.datatype.number
      const price = faker.number.int({ min: 20, max: 200 })
      const category = faker.helpers.arrayElement([
        'fitness',
        'haircut',
        'consultation',
        'tutoring',
        'dental',
      ])
      const duration = faker.helpers.arrayElement([30, 45, 60, 90])
      const address = `${faker.location.streetAddress()}, ${faker.location.city()}`
      const businessHours = {
        Monday: { from: '09:00:00', to: '17:00:00', closed: false },
        Tuesday: { from: '09:00:00', to: '17:00:00', closed: false },
        Wednesday: { from: '09:00:00', to: '17:00:00', closed: false },
        Thursday: { from: '09:00:00', to: '17:00:00', closed: false },
        Friday: { from: '09:00:00', to: '17:00:00', closed: false },
        Saturday: { from: '10:00:00', to: '14:00:00', closed: false },
        Sunday: { from: '00:00:00', to: '00:00:00', closed: true },
      }

      const svc = new Service({
        admin: adminId,
        serviceName,
        category,
        price,
        duration,
        address,
        businessHours,
      })
      await svc.save()
      serviceDocs.push(svc)
    }
    console.log('✅ [seedData] Created one Service per admin (10 total).')

    // 3) Create 50 random Appointments
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled']
    const now = new Date()

    for (let i = 0; i < 50; i++) {
      // (1) Pick a random service
      const svc = faker.helpers.arrayElement(serviceDocs)

      // (2) Pick a random customer
      const custId = faker.helpers.arrayElement(customerIds)

      // (3) Generate a random future slot within the next 30 days
      const daysAhead = faker.number.int({ min: 1, max: 30 })
      const slotStart = new Date(
        now.getTime() + daysAhead * 24 * 60 * 60 * 1000
      )
      // Force into working hours: hour 9–16, minute 0 or 30
      const hourPick = faker.number.int({ min: 9, max: 16 })
      const minutePick = faker.helpers.arrayElement([0, 30])
      slotStart.setHours(hourPick, minutePick, 0, 0)
      const slotEnd = new Date(slotStart.getTime() + svc.duration * 60 * 1000)

      // (4) Random status
      const status = faker.helpers.arrayElement(statuses)

      // (5) Payment
      const serviceCost = svc.price
      const membershipDiscount = 0
      const totalDue = serviceCost - membershipDiscount

      // (6) Create Appointment document
      const appt = new Appointment({
        customer: custId,
        customerName: faker.person.fullName(),
        service: svc._id,
        slot: {
          start: slotStart,
          end: slotEnd,
        },
        note: faker.lorem.sentence(),
        mobile: faker.phone.number('04########'),
        scheduledAt: slotStart,
        status,
        payment: {
          serviceCost,
          membershipDiscount,
          totalDue,
        },
      })
      await appt.save()
    }

    console.log('✅ [seedData] Created 50 random appointments.')
  } catch (err) {
    console.error('❌ [seedData] Error:', err)
    throw err
  }
}
