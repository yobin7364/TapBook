import Appointment from '../models/Appointment.module.js'

export async function autoCompleteAppointments() {
  const now = new Date()
  // Find appointments that are confirmed and in the past
  const result = await Appointment.updateMany(
    {
      status: 'confirmed',
      'slot.end': { $lte: now },
    },
    { $set: { status: 'completed' } }
  )
  if (result.modifiedCount > 0) {
    console.log(
      `[Auto-complete] Marked ${result.modifiedCount} appointments as completed`
    )
  }
}
