import Service from '../models/Service.module.js'
import { validateService } from '../validator/service.validator.js'

// @route   POST /api/admin/services
// @desc    Create a new service (admin only)
// @access  Private
export const createService = async (req, res) => {
  const { errors, isValid } = validateService(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  try {
    const service = new Service({
      admin: req.user.id, // ← user must be admin
      ...req.body,
    })
    await service.save()
    return res.status(201).json({ success: true, service })
  } catch (err) {
    console.error('Service creation error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   GET /api/admin/services
// @desc    List all services (admin view)
// @access  Private
export const listServices = async (req, res) => {
  try {
    const services = await Service.find().populate('admin', 'name email') // ← populate admin
    return res.json({ success: true, services })
  } catch (err) {
    console.error('List services error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   PUT /api/admin/services/:id
// @desc    Update a service (admin only)
// @access  Private
export const updateService = async (req, res) => {
  const { errors, isValid } = validateService(req.body)
  if (!isValid) {
    return res.status(400).json({ success: false, errors })
  }

  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, admin: req.user.id }, // ← match on admin
      req.body,
      { new: true }
    )
    if (!service) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }
    return res.json({ success: true, service })
  } catch (err) {
    console.error('Update service error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}

// @route   DELETE /api/admin/services/:id
// @desc    Delete a service (admin only)
// @access  Private
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      admin: req.user.id, // ← match on admin
    })
    if (!service) {
      return res
        .status(404)
        .json({ success: false, error: 'Service not found' })
    }
    return res.json({ success: true, message: 'Service deleted' })
  } catch (err) {
    console.error('Delete service error:', err)
    return res.status(500).json({ success: false, error: 'Server error' })
  }
}
