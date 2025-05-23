import Joi from 'joi'

export const validateChangePassword = (data) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required().messages({
      'string.empty': 'Old password is required',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters',
      'string.empty': 'New password is required',
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
