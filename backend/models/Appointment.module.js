import mongoose from 'mongoose'
const { Schema } = mongoose

const AppointmentSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    slot: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    scheduledAt: { type: Date},
    reminded: {type: Boolean, default: false},
    
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
)

export default mongoose.model('Appointment', AppointmentSchema)
