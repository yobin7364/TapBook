import Joi from 'joi'

export const validateAppointment = (data) => {
  const schema = Joi.object({
    service: Joi.string().hex().length(24).required().messages({
      'string.empty': 'Service ID is required',
      'string.length': 'Service ID must be a valid ObjectId',
      'string.hex': 'Service ID must be a valid ObjectId',
    }),
    slot: Joi.object({
      start: Joi.string().isoDate().required().messages({
        'string.empty': 'Start time is required',
        'string.isoDate': 'Start time must be a valid ISO 8601 datetime',
      }),
      
    })
      .required()
      .messages({
        'object.base': 'Slot is required',
        'any.required': 'Slot is required',
      }),
    mobile: Joi.string().min(6).max(20).optional().messages({
      'string.min': 'Mobile number must be at least 6 digits',
      'string.max': 'Mobile number must be at most 20 digits',
    }),
    note: Joi.string().max(500).optional().messages({
      'string.max': 'Note must be at most 500 characters',
    }),
  })
    // Custom rule: end must be after start
    .custom((obj, helpers) => {
      if (obj.slot && obj.slot.start && obj.slot.end) {
        const start = new Date(obj.slot.start)
        const end = new Date(obj.slot.end)
        if (isNaN(start) || isNaN(end) || end <= start) {
          return helpers.error('any.invalid', {
            message: 'End must be after start',
          })
        }
      }
      return obj
    }, 'End-after-start check')

  const { error } = schema.validate(data, { abortEarly: false })
  return {
    isValid: !error,
    errors: error
      ? error.details.reduce((acc, curr) => {
          const key = curr.path.join('.')
          acc[key] = curr.message || curr.context?.message || 'Invalid input'
          return acc
        }, {})
      : {},
  }
}
