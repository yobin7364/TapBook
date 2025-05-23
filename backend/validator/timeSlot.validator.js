import Joi from 'joi'

export const validateTimeSlot = (data) => {
  const schema = Joi.object({
    start: Joi.date()
      .required()
      .messages({ 'date.base': 'Start must be a valid date' }),
    end: Joi.date().greater(Joi.ref('start')).required().messages({
      'date.base': 'End must be a valid date',
      'date.greater': 'End must come after start',
    }),
  })

  const { error } = schema.validate(data, { abortEarly: false })

  return {
    isValid: !error,
    errors: error
      ? error.details.reduce((acc, cur) => {
          acc[cur.path[0]] = cur.message
          return acc
        }, {})
      : {},
  }
}
