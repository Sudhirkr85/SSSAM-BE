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
  applicationIdParamSchema
} = require('../validators/certificate.validator');
const { applyLimiter, downloadLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/apply', applyLimiter, validate(applySchema), applyCertificate);
router.get('/verify', validate(verifyQuerySchema, 'query'), verifyCertificateByNumber);
router.post('/download', downloadLimiter, validate(downloadSchema), downloadCertificate);
router.get('/status/:applicationId', validate(applicationIdParamSchema, 'params'), getStatusByApplicationId);

// Public Testing Routes (Bypasses Admin Auth Token for Local/Dev testing)
router.patch('/approve/:applicationId', approveApplicationByAdmin);
router.patch('/reject/:applicationId', rejectApplicationByAdmin);

module.exports = router;
