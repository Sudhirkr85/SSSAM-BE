const Joi = require('joi');

const enquirySchema = Joi.object({
  fullName: Joi.string().trim().required().messages({
    'string.empty': 'Full name is required',
    'any.required': 'Full name is required'
  }),
  phoneNumber: Joi.string().trim().required().pattern(/^[0-9]{10}$/).messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
    'string.pattern.base': 'Phone number must be 10 digits'
  }),
  course: Joi.string().trim().required().messages({
    'string.empty': 'Course is required',
    'any.required': 'Course is required'
  }),
  customCourseName: Joi.string()
    .trim()
    .when('course', {
      is: 'Others',
      then: Joi.required().messages({
        'string.empty': 'Please enter course name',
        'any.required': 'Please enter course name'
      }),
      otherwise: Joi.optional().allow('', null)
    }),
  demoType: Joi.string()
    .trim()
    .required()
    .valid('Online', 'Live Classes', 'Offline (Gurugram)')
    .messages({
      'string.empty': 'Demo type is required',
      'any.required': 'Demo type is required',
      'any.only': 'Invalid demo type selected'
    }),
  message: Joi.string().trim().optional().allow('')
});

const enquiryIdParamSchema = Joi.object({
  enquiryId: Joi.string().trim().required().messages({
    'string.empty': 'Enquiry ID is required',
    'any.required': 'Enquiry ID is required'
  })
});

const updateEnquirySchema = Joi.object({
  status: Joi.string()
    .trim()
    .required()
    .valid('Pending', 'Scheduled', 'Completed', 'Cancelled')
    .messages({
      'string.empty': 'Status is required',
      'any.required': 'Status is required',
      'any.only': 'Invalid status value'
    })
});

const validate = (schema, location = 'body') => {
  return (req, res, next) => {
    const source = location === 'body' ? req.body : location === 'params' ? req.params : req.query;
    const { error, value } = schema.validate(source, { abortEarly: false });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: messages
      });
    }

    if (location === 'body') req.body = value;
    else if (location === 'params') req.params = value;
    else req.query = value;

    next();
  };
};

module.exports = {
  enquirySchema,
  enquiryIdParamSchema,
  updateEnquirySchema,
  validate
};
