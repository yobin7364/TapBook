// seedData/userSeed.js
import bcrypt from 'bcryptjs'
import User from '../models/User.module.js'
import { faker } from '@faker-js/faker'

// Export a function that seeds ONLY users (admins + customers),
// under the assumption that mongoose.connect(...) is already called.
export async function seedUsers() {
  try {
    // 1) Clear existing users (so we start fresh in the seed DB)
    await User.deleteMany()
    console.log('✅ [userSeed] Cleared User collection.')

    // 2) Create 10 admin accounts
    const adminIds = []
    for (let i = 0; i < 10; i++) {
      const name = faker.person.fullName()
      const email = faker.internet.email().toLowerCase()
      const rawPwd = 'Password@123'
      const salt = await bcrypt.genSalt(10)
      const hashed = await bcrypt.hash(rawPwd, salt)

      const admin = new User({
        name,
        email,
        password: hashed,
        role: 'admin',
        mobile: faker.phone.number('04########'),
        // …add any required fields your User schema needs
      })
      await admin.save()
      adminIds.push(admin._id)
    }
    console.log('✅ [userSeed] Created 10 admin users.')

    // 3) Create 20 customer (role=user) accounts
    const customerIds = []
    for (let j = 0; j < 20; j++) {
      const name = faker.person.fullName()
      const email = faker.internet.email().toLowerCase()
      const rawPwd = 'Password@123'
      const salt = await bcrypt.genSalt(10)
      const hashed = await bcrypt.hash(rawPwd, salt)

      const user = new User({
        name,
        email,
        password: hashed,
        role: 'user',
        mobile: faker.phone.number('04########'),
        // …add any required fields your User schema needs
      })
      await user.save()
      customerIds.push(user._id)
    }
    console.log('✅ [userSeed] Created 20 customer users.')

    // 4) Return the two ID arrays so seedData.js can use them
    return { adminIds, customerIds }
  } catch (err) {
    console.error('❌ [userSeed] Error while seeding users:', err)
    throw err
  }
}
