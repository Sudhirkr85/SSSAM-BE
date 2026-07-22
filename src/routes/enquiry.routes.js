const express = require('express');
const {
  createEnquiry,
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
router.post('/', enquiryLimiter, validate(enquirySchema), createEnquiry);
router.get('/status/:enquiryId', validate(enquiryIdParamSchema, 'params'), getEnquiryStatusById);

module.exports = router;
