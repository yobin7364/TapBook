import Joi from 'joi'

export const validateAppointment = (data) => {
  const schema = Joi.object({
    service: Joi.string().hex().length(24).required().messages({
      'string.empty': 'Service ID is required',
      'string.length': 'Service ID must be a valid ObjectId',
    }),
    slot: Joi.object({
      start: Joi.date()
        .required()
        .messages({ 'date.base': 'Start date is required' }),
      end: Joi.date().required().greater(Joi.ref('start')).messages({
        'date.base': 'End date is required',
        'date.greater': 'End must be after start',
      }),
    })
      .required()
      .messages({ 'object.base': 'Slot is required' }),
  })

  const { error } = schema.validate(data, { abortEarly: false })
  return {
    isValid: !error,
    errors: error
      ? error.details.reduce((acc, curr) => {
          const key = curr.path.join('.')
          acc[key] = curr.message
          return acc
        }, {})
      : {},
  }
}
