import Joi from "joi";

export const validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().required().messages({
      "string.empty": "Name is required.",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please enter a valid email.",
      "string.empty": "Email is required.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long.",
      "string.empty": "Password is required.",
    }),
    password2: Joi.any().equal(Joi.ref("password")).required().messages({
      "any.only": "Passwords do not match.",
      "any.required": "Confirm password is required.",
    }),
    role: Joi.string().valid("user", "admin").required().messages({
      "any.only": "Role must be either 'user' or 'admin'.",
      "any.required": "Role is required.",
    }),
  });

  const { error } = schema.validate(data, { abortEarly: false }); // Capture all errors
  const errors = error
    ? error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message; // Map each error to its field
        return acc;
      }, {})
    : {};

  return { errors, isValid: !error }; // Return errors and isValid
};
