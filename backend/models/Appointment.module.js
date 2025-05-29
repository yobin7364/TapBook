import mongoose from 'mongoose'
const { Schema } = mongoose

const AppointmentSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type:String,
      required: true

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
    note: { type: String, default: ' ' },
    mobile: { type: String, required: true },
    scheduledAt: { type: Date },
    reminded: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined', 'cancelled', 'completed'],
      default: 'pending',
    },
    cancelNote: {
      type: String,
      default: '',
    },
    payment: {
      serviceCost: { type: Number, required: true },
      membershipDiscount: { type: Number, required: true, default: 0 },
      totalDue: { type: Number, required: true },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
)
AppointmentSchema.index({ status: 1, 'slot.end': 1 })

export default mongoose.model('Appointment', AppointmentSchema)
