// models/Notification.module.js
import mongoose from 'mongoose'
const { Schema } = mongoose

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['status', 'reminder'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Notification', NotificationSchema)
