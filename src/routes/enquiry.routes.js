const express = require('express');
const {
  bookDemoClass,
  getEnquiryStatusById,
  listAllEnquiries,
  updateEnquiry,
  removeEnquiry
} = require('../controllers/enquiry.controller');
const {
  enquirySchema,
  enquiryIdParamSchema,
  updateEnquirySchema,
  validate
} = require('../validators/enquiry.validator');
const enquiryLimiter = require('../middlewares/enquiryLimiter');

const router = express.Router();

// Public routes
router.post('/demo-class', enquiryLimiter, validate(enquirySchema), bookDemoClass);
router.get('/status/:enquiryId', validate(enquiryIdParamSchema, 'params'), getEnquiryStatusById);

// Admin routes (can be protected by auth in future)
router.get('/admin/all', listAllEnquiries);
router.patch('/admin/:enquiryId/update', validate(enquiryIdParamSchema, 'params'), validate(updateEnquirySchema), updateEnquiry);
router.delete('/admin/:enquiryId', validate(enquiryIdParamSchema, 'params'), removeEnquiry);

module.exports = router;
