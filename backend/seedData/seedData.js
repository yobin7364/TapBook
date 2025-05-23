import mongoose from 'mongoose'
import { seedUsers } from './userSeed.js' // Import user seed function

mongoose.connect(
  'mongodb+srv://punyobin123:AixTYnyUJjToKrZT@cluster0.v98owjt.mongodb.net/tapbook_db?retryWrites=true&w=majority&appName=Cluster0'
)

const seedData = async () => {
  try {
    // Seed users first
    await seedUsers()

    console.log('Data seeding completed!')
    mongoose.disconnect() // Disconnect from the database once seeding is done
  } catch (err) {
    console.error('Error while seeding data:', err)
  }
}

// Run the seed data function
seedData()
