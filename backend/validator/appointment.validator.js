// validator/appointment.validator.js

import Joi from 'joi'

export const validateAppointment = (data) => {
  const schema = Joi.object({
    service: Joi.string().hex().length(24).required().messages({
      'string.empty': 'Service ID is required',
      'string.length': 'Service ID must be a valid ObjectId',
      'string.hex': 'Service ID must be a valid ObjectId',
      'any.required': 'Service ID is required',
    }),

    customerName: Joi.string().trim().min(2).required().messages({
      'string.empty': 'Name is required',
      'any.required': 'Name is required',
      'string.min': 'Name must be at least {#limit} characters',
    }),

    start: Joi.string().isoDate().required().messages({
      'string.empty': 'Start time is required',
      'string.isoDate': 'Start time must be a valid ISO 8601 datetime',
      'any.required': 'Start time is required',
    }),

    mobile: Joi.string().trim().min(6).max(20).required().messages({
      'string.empty': 'Mobile number is required',
      'string.min': 'Mobile number must be at least {#limit} digits',
      'string.max': 'Mobile number must be at most {#limit} digits',
      'any.required': 'Mobile number is required',
    }),

    note: Joi.string().max(500).allow('').messages({
      'string.max': 'Note must be at most {#limit} characters',
    }),
  })

  const { error } = schema.validate(data, { abortEarly: false })
  const errors = {}
  if (error) {
    error.details.forEach((err) => {
      const key = err.path[0]
      errors[key] = err.message
    })
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
