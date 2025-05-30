import mongoose from 'mongoose'
const { Schema } = mongoose

const BusinessHourSchema = new Schema(
  {
    from: { type: String, required: true }, // ISO time string e.g. "09:00:00" or "09:00:00.000Z"
    to: { type: String, required: true }, // ISO time string e.g. "17:00:00" or "17:00:00.000Z"
    closed: { type: Boolean, required: true },
  },
  { _id: false }
)

const ServiceSchema = new Schema(
  {
    serviceName: {
      type: String,
      required: true
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Each admin can have only one service
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number, // duration in minutes; you can switch to String if you want ISO-8601 like "PT30M"
      required: true,
      min: 1,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    businessHours: {
      type: Map,
      of: BusinessHourSchema,
      required: true,
      // This lets you store keys as weekdays, e.g., "Monday": {from, to, closed}
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
)

export default mongoose.model('Service', ServiceSchema)
