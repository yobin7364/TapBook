import mongoose from 'mongoose'
const { Schema } = mongoose

// Create schema
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    resetPasswordToken: { type: String },
    resetTokenExpiry: { type: Date },
    availableTimeSlots: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
      },
    ],
    membership: {
      plan: {
        type: String,
        enum: ['none', 'monthly', 'yearly'],
        default: 'none',
      },
      startDate: Date,
      expiryDate: Date,
      cancelled: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
)

// "users" is a collection (like a table in SQL)
const User = mongoose.model('User', UserSchema)

// Exporting the model
export default User
