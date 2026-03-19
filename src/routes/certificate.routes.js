const express = require('express');
const {
  applyCertificate,
  verifyCertificateByNumber,
  downloadCertificate,
  getStatusByApplicationId,
  approveApplicationByAdmin,
  rejectApplicationByAdmin
} = require('../controllers/certificate.controller');
const {
  validate,
  applySchema,
  verifyQuerySchema,
  downloadSchema,
  applicationIdParamSchema,
  rejectSchema
} = require('../validators/certificate.validator');
const applyLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/apply', applyLimiter, validate(applySchema), applyCertificate);
router.get('/verify', validate(verifyQuerySchema, 'query'), verifyCertificateByNumber);
router.post('/download', validate(downloadSchema), downloadCertificate);
router.get('/status/:applicationId', validate(applicationIdParamSchema, 'params'), getStatusByApplicationId);

// Admin/testing utility routes (can be protected by auth in future)
router.patch(
  '/admin/:applicationId/approve',
  validate(applicationIdParamSchema, 'params'),
  approveApplicationByAdmin
);
router.patch(
  '/admin/:applicationId/reject',
  validate(applicationIdParamSchema, 'params'),
  validate(rejectSchema),
  rejectApplicationByAdmin
);

module.exports = router;
