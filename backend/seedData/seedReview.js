// seedData/seedReviews.js

import Review from '../models/Review.module.js'
import Appointment from '../models/Appointment.module.js'
import { faker } from '@faker-js/faker'

/**
 * Seed one review for every completed appointment (no randomness).
 */
export async function seedReviews() {
  try {
    // 1) Remove any old reviews
    await Review.deleteMany({})
    console.log('✅ [seedReviews] Cleared Review collection.')

    // 2) Fetch all completed appointments, populated with service→admin
    const completedAppts = await Appointment.find({ status: 'completed' })
      .populate({ path: 'service', select: 'admin' })
      .lean()

    if (completedAppts.length === 0) {
      console.log(
        'ℹ️  [seedReviews] No completed appointments found. Skipping.'
      )
      return
    }

    // 3) Create a review for each appointment
    const reviewsToInsert = completedAppts.map((appt) => {
      const appointmentId = appt._id
      const reviewerId = appt.customer
      const revieweeId = appt.service.admin

      const rating = faker.number.int({ min: 1, max: 5 })
      const comment = faker.lorem.sentence()

      return {
        appointment: appointmentId,
        reviewer: reviewerId,
        reviewee: revieweeId,
        rating,
        comment,
        createdAt: new Date(),
      }
    })

    // 4) Bulk‐insert all reviews
    await Review.insertMany(reviewsToInsert)
    console.log(`✅ [seedReviews] Inserted ${reviewsToInsert.length} reviews.`)
  } catch (err) {
    console.error('❌ [seedReviews] Error in seeding reviews:', err)
    throw err
  }
}
