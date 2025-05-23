import Joi from 'joi'

export const validateService = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title must be at most 100 characters',
    }),
    description: Joi.string().min(10).required().messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters',
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
