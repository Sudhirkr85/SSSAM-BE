const Joi = require('joi');

const certificateTypes = ['Training', 'Workshop', 'Internship', 'Industrial Training', 'Academic Training', 'Corporate Training'];

const applySchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z\s.'-]+$/)
    .min(2)
    .max(120)
    .required()
    .messages({
      'string.pattern.base': 'fullName must contain only letters and spaces'
    }),
  phoneNumber: Joi.string()
    .trim()
    .custom((val, helpers) => {
      const clean = val.replace(/\s/g, "");
      if (!/^[6-9]\d{9}$/.test(clean)) {
        return helpers.error('string.pattern.base');
      }
      return clean; // return cleaned value (no spaces)
    })
    .required()
    .messages({
      'string.pattern.base': 'phoneNumber must be a valid Indian 10-digit mobile number.'
    }),
  email: Joi.string().trim().email().required(),
  dateOfBirth: Joi.date().required(),
  qualification: Joi.string().trim().min(2).max(200).optional().allow('', null),
  course: Joi.string().trim().min(1).max(200).required(),
  organization: Joi.string().trim().min(1).max(200).optional().allow('', null),
  certificateType: Joi.string()
    .valid(...certificateTypes)
    .required(),
  duration: Joi.string().trim().min(1).max(100).required(),
  durationDates: Joi.string().trim().min(1).max(100).optional().allow('', null)
});

const verifyQuerySchema = Joi.object({
  certificateNumber: Joi.string().trim().required()
});

const downloadSchema = Joi.object({
  certificateNumber: Joi.string().trim().required(),
  dateOfBirth: Joi.date().required()
});

const applicationIdParamSchema = Joi.object({
  applicationId: Joi.string().trim().required()
});

const rejectSchema = Joi.object({
  remarks: Joi.string().trim().max(500).allow('', null)
});

const validate = (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const err = new Error(error.details.map((item) => item.message).join(', '));
    err.statusCode = 400;
    return next(err);
  }

  req[source] = value;
  return next();
};

module.exports = {
  validate,
  applySchema,
  verifyQuerySchema,
  downloadSchema,
  applicationIdParamSchema,
  rejectSchema
};
