import User from '../models/User.module.js'
import { validateTimeSlot } from '../validator/timeSlot.validator.js'

// @desc    Add a new available slot to the logged-in admin
// @route   POST /api/admin/time-slots
// @access  Private (admin)
export const addTimeSlot = async (req, res) => {
  const { errors, isValid } = validateTimeSlot(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  const { start, end } = req.body
  const adminId = req.user.id

  try {
    const admin = await User.findById(adminId)
    // Check overlap
    const overlap = admin.availableTimeSlots.some(
      (slot) => new Date(start) < slot.end && new Date(end) > slot.start
    )
    if (overlap) {
      return res.status(400).json({
        success: false,
        error: { message: 'Time slot overlaps an existing one.' },
      })
    }

    admin.availableTimeSlots.push({ start, end })
    await admin.save()
    return res.status(201).json({
      success: true,
      message: 'Time slot added',
      slots: admin.availableTimeSlots,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @desc    List all available slots for logged-in admin
// @route   GET /api/admin/time-slots
// @access  Private (admin)
export const getTimeSlots = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id)
    return res.json({ success: true, slots: admin.availableTimeSlots })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @desc    Delete a specific slot
// @route   DELETE /api/admin/time-slots/:slotId
// @access  Private (admin)
export const deleteTimeSlot = async (req, res) => {
  const { slotId } = req.params
  try {
    const admin = await User.findById(req.user.id)
    const before = admin.availableTimeSlots.length
    admin.availableTimeSlots = admin.availableTimeSlots.filter(
      (slot) => slot._id.toString() !== slotId
    )
    if (admin.availableTimeSlots.length === before) {
      return res.status(404).json({ success: false, error: 'Slot not found' })
    }
    await admin.save()
    return res.json({ success: true, message: 'Slot deleted' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
