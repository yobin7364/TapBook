import mongoose from 'mongoose'
const { Schema } = mongoose

const ServiceSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
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
      type: Number, // duration in minutes
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
)

export default mongoose.model('Service', ServiceSchema)
