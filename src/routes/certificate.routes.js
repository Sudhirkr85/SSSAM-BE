const express = require('express');
const {
  applyCertificate,
  verifyCertificateByNumber,
  downloadCertificate,
  getStatusByApplicationId
} = require('../controllers/certificate.controller');
const {
  validate,
  applySchema,
  verifyQuerySchema,
  downloadSchema,
  applicationIdParamSchema
} = require('../validators/certificate.validator');
const applyLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/apply', applyLimiter, validate(applySchema), applyCertificate);
router.get('/verify', validate(verifyQuerySchema, 'query'), verifyCertificateByNumber);
router.post('/download', validate(downloadSchema), downloadCertificate);
router.get('/status/:applicationId', validate(applicationIdParamSchema, 'params'), getStatusByApplicationId);

module.exports = router;
