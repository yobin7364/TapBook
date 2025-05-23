import mongoose from 'mongoose'
import bcrypt from 'bcryptjs' // bcryptjs is often better for async hashing
import User from '../models/User.module.js' // Adjust path accordingly
import { faker } from '@faker-js/faker'

// Function to generate users
export const seedUsers = async () => {
  try {
    // Remove all existing users to avoid duplication
    await User.deleteMany()
    console.log('Existing users deleted.')

    // Generate 20 dummy users
    const users = await Promise.all(
      Array.from({ length: 20 }).map(async () => {
        const name = faker.person.fullName()
        const email = faker.internet.email()
        const password = 'Password@123' // Static password for simplicity
        const role = Math.random() > 0.5 ? 'user' : 'admin' // Randomly assign a role

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        return {
          name,
          email,
          password: hashedPassword,
          role,
          ...User(
            role === 'admin'
              ? {
                  availableTimeSlots: [
                    {
                      start: faker.date.future(),
                      end: faker.date.future(),
                    },
                  ],
                }
              : {}
          ),
        }
      })
    )

    // Insert users into DB
    await User.insertMany(users)
    console.log('Users created successfully!')
  } catch (err) {
    console.error('Error while seeding users:', err)
    mongoose.disconnect()
  }
}
