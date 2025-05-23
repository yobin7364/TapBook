import Joi from 'joi'

export const validateReview = (data) => {
  const schema = Joi.object({
    appointment: Joi.string().hex().length(24).required().messages({
      'string.empty': 'Appointment ID is required',
      'string.length': 'Appointment ID must be a valid ObjectId',
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required',
    }),
    comment: Joi.string().max(500).allow('').messages({
      'string.max': 'Comment cannot exceed 500 characters',
    }),
  })

  const { error } = schema.validate(data, { abortEarly: false })
  return {
    isValid: !error,
    errors: error
      ? error.details.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message
          return acc
        }, {})
      : {},
  }
}
