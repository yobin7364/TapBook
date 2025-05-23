import Joi from 'joi'

export const validateUpdateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
  })

  const { error, value } = schema.validate(data, { abortEarly: false })

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
