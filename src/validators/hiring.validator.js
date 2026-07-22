const Joi = require("joi");

const hiringRequestSchema = Joi.object({
  companyName: Joi.string().trim().required().messages({
    "string.empty": "Company name is required",
    "any.required": "Company name is required",
  }),
  hrName: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z\s.'-]+$/)
    .required()
    .messages({
      "string.empty": "HR name is required",
      "any.required": "HR name is required",
      "string.pattern.base": "HR name must contain only letters",
    }),
  mobileNumber: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "any.required": "Mobile number is required",
      "string.pattern.base": "Mobile number must be 10 digits",
    }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "any.required": "Email is required",
    "string.email": "Enter a valid email address",
  }),
  techDomain: Joi.string().trim().required().messages({
    "string.empty": "Tech domain is required",
    "any.required": "Tech domain is required",
  }),
});

const validate = (schema, location = "body") => {
  return (req, res, next) => {
    const source =
      location === "body"
        ? req.body
        : location === "params"
        ? req.params
        : req.query;
    const { error, value } = schema.validate(source, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      return res.status(400).json({ success: false, statusCode: 400, message: messages });
    }
    if (location === "body") req.body = value;
    next();
  };
};

module.exports = { hiringRequestSchema, validate };
