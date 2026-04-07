const express = require('express');
const {
  bookDemoClass,
  getEnquiryStatusById
} = require('../controllers/enquiry.controller');
const {
  enquirySchema,
  enquiryIdParamSchema,
  validate
} = require('../validators/enquiry.validator');
const enquiryLimiter = require('../middlewares/enquiryLimiter');

const router = express.Router();

// Public routes
router.post('/demo-class', enquiryLimiter, validate(enquirySchema), bookDemoClass);
router.get('/status/:enquiryId', validate(enquiryIdParamSchema, 'params'), getEnquiryStatusById);

module.exports = router;
