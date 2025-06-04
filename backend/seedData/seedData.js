// seed.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { faker } from '@faker-js/faker'

// 1. Load .env (make sure MONGO_URI is set)
dotenv.config()

// 2. Import your Mongoose models (adjust paths as needed)
import User from './models/User.js'
import Service from './models/Service.js'
import Appointment from './models/Appointment.js'

// 3. Utility: connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected for seeding')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

// 4. Main seeding logic
async function seed() {
  await connectDB()

  // --- A. Clear out existing data ---
  await Appointment.deleteMany({})
  await Service.deleteMany({})
  await User.deleteMany({})

  console.log('Cleared User, Service, Appointment collections.')

  // --- B. Create 10 Providers (and their Services) ---
  const providerIds = []
  const serviceDocs = []

  for (let i = 0; i < 10; i++) {
    const name = faker.person.findName()
    const email = faker.internet.email().toLowerCase()
    const password = 'passWord123!' 
    const mobile = faker.phone.phoneNumber('04########')
    const role = 'provider'

    // 1) Create provider user
    const provider = new User({
      name,
      email,
      password,
      mobile,
      role,
      // ...any other required User fields
    })
    await provider.save()
    providerIds.push(provider._id)

    // 2) Create at least one Service for this provider
    //    (you could create multiple per provider if you want)
    const serviceName = faker.commerce.productName() // e.g. "Premium Yoga Class"
    const price = faker.datatype.number({ min: 20, max: 200 })
    const category = faker.helpers.randomize([
      'fitness',
      'haircut',
      'consultation',
      'tutoring',
      'dental',
    ])
    const duration = faker.helpers.randomize([30, 45, 60, 90])
    const address = faker.location.streetAddress() + ', ' + faker.location.city()
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
      admin: provider._id,
      title: serviceName,
      category,
      price,
      duration,
      address,
      businessHours,
      // ...any other required Service fields
    })
    await svc.save()
    serviceDocs.push(svc)
  }

  console.log('Created 10 providers and their Services.')

  // --- C. Create ~20 Customers (so bookings can pick from them) ---
  const customerIds = []
  for (let j = 0; j < 20; j++) {
    const name = faker.person.findName()
    const email = faker.internet.email().toLowerCase()
    const password = 'passWord123!'
    const mobile = faker.phone.phoneNumber('04########')
    const role = 'user'

    const user = new User({
      name,
      email,
      password,
      role,
      // ...other User fields
    })
    await user.save()
    customerIds.push(user._id)
  }

  console.log('Created 20 customer users.')

  // --- D. Create 50 Appointments ---
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled']
  const now = new Date()

  for (let k = 0; k < 50; k++) {
    // 1) Pick a random service
    const svc = faker.helpers.randomize(serviceDocs)

    // 2) Pick a random customer
    const custId = faker.helpers.randomize(customerIds)

    // 3) Make a random slot within the next 30 days, on the provider’s business hours
    //    For simplicity, generate a random date/time; adjust as needed to match businessHours in your model
    const randomOffsetDays = faker.datatype.number({ min: 1, max: 30 })
    const slotDate = new Date(
      now.getTime() + randomOffsetDays * 24 * 60 * 60 * 1000
    )
    // Force it into a working hour: e.g., 10:00–10:30
    slotDate.setHours(faker.datatype.number({ min: 9, max: 15 }))
    slotDate.setMinutes(faker.helpers.randomize([0, 30]))
    slotDate.setSeconds(0)
    const slotEnd = new Date(slotDate.getTime() + svc.duration * 60 * 1000)

    // 4) Random status
    const status = faker.helpers.randomize(statuses)

    // 5) Payment object (if your schema requires it; else skip)
    const serviceCost = svc.price
    const membershipDiscount = 0 // or randomize if you have membership logic
    const totalDue = serviceCost - membershipDiscount

    // 6) Create appointment
   const slotDate = faker.date.future(); // random upcoming time
const duration = svc.duration;        // from service, in minutes
const slotEnd = new Date(slotDate.getTime() + duration * 60000);

const serviceCost = svc.price;
const membershipDiscount = faker.datatype.number({ min: 0, max: 10 });
const totalDue = serviceCost - membershipDiscount;

const appt = new Appointment({
  customer: custId,
  customerName: faker.name.fullName(),
  service: svc._id,
  slot: {
    start: slotDate,
    end: slotEnd,
  },
  note: faker.lorem.sentence(),
  mobile: faker.phone.phoneNumber('04########'),
  scheduledAt: slotDate,
  status: faker.helpers.arrayElement(['pending', 'confirmed', 'completed']),
  payment: {
    serviceCost,
    membershipDiscount,
    totalDue,
  },
});
await appt.save();


  console.log('Created 50 random appointments.')

  // 7. Disconnect
  await mongoose.disconnect()
  console.log('Seeding complete. MongoDB disconnected.')
}

seed().catch((err) => {
  console.error('Seeding error:', err)
  process.exit(1)
})
}