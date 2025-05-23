import Joi from 'joi'

export const validateForgotPassword = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid address',
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
