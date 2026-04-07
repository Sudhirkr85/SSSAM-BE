const express = require("express");
const authMiddleware = require("../../middleware/auth");
const adminAuthController = require("../controllers/admin.auth.controller");
const adminCertificateController = require("../controllers/admin.certificate.controller");
const adminEnquiryController = require("../controllers/admin.enquiry.controller");

const router = express.Router();

router.post("/auth/login", adminAuthController.login);

router.use(authMiddleware);

router.get("/applications", adminCertificateController.listApplications);
router.get("/applications/:applicationId", adminCertificateController.getApplication);
router.patch(
  "/applications/:applicationId/approve",
  adminCertificateController.approveApplication,
);
router.patch(
  "/applications/:applicationId/reject",
  adminCertificateController.rejectApplication,
);
router.patch(
  "/applications/:applicationId/update",
  adminCertificateController.updateApplication,
);

router.get("/certificates", adminCertificateController.listCertificates);
router.patch(
  "/certificates/:certificateNumber",
  adminCertificateController.updateCertificate,
);

router.get("/enquiries", adminEnquiryController.listEnquiries);
router.get("/enquiries/:enquiryId", adminEnquiryController.getEnquiry);
router.patch(
  "/enquiries/:enquiryId/status",
  adminEnquiryController.updateStatus,
);
router.patch(
  "/enquiries/:enquiryId/follow-up",
  adminEnquiryController.followUp,
);
router.patch("/enquiries/:enquiryId/close", adminEnquiryController.closeEnquiry);
router.delete("/enquiries/:enquiryId", adminEnquiryController.deleteEnquiry);

module.exports = router;