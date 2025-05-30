import Joi from 'joi'

const businessHourSchema = Joi.object({
  from: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required()
    .messages({
      'string.empty': 'Start time is required',
      'string.pattern.base': 'Start time must be in HH:mm:ss format',
    }),
  to: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required()
    .messages({
      'string.empty': 'End time is required',
      'string.pattern.base': 'End time must be in HH:mm:ss format',
    }),
  closed: Joi.boolean().required().messages({
    'boolean.base': 'Closed must be true or false',
  }),
})

export const validateService = (data) => {
  const schema = Joi.object({
    serviceName: Joi.string().trim().min(2).required().messages({
      'any.required': 'Service name is required',
      'string.empty': 'Service name is required',
      'string.min': 'Service name must be at least {#limit} characters',
    }),
    category: Joi.string().required().messages({
      'string.empty': 'Category is required',
    }),
    price: Joi.number().min(0).required().messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
    }),
    duration: Joi.number().integer().min(1).required().messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be at least 1 minute',
    }),
    address: Joi.string().min(3).max(200).required().messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 3 characters',
      'string.max': 'Address must be at most 200 characters',
    }),
    businessHours: Joi.object()
      .pattern(
        Joi.string().valid(
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ),
        businessHourSchema
      )
      .required()
      .messages({
        'object.base': 'Business hours must be an object with weekdays as keys',
        'any.required': 'Business hours are required',
      }),
  })

  const { error } = schema.validate(data, { abortEarly: false })
  return {
    isValid: !error,
    errors: error
      ? error.details.reduce((acc, curr) => {
          acc[curr.path.join('.')] = curr.message
          return acc
        }, {})
      : {},
  }
}
