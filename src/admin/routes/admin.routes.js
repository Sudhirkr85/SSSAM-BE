const express = require("express");

const adminCertificateController = require("../controllers/admin.certificate.controller");
const adminEnquiryController = require("../controllers/admin.enquiry.controller");

const router = express.Router();

// ===============================
// 📄 APPLICATION ROUTES (NEW)
// ===============================

// Get all applications
router.get("/applications", adminCertificateController.listApplications);

// Get single application
router.get("/applications/:id", adminCertificateController.getApplication);

// Update application
router.put("/applications/:id", adminCertificateController.updateApplication);

// Approve application
router.post("/applications/:id/approve", adminCertificateController.approveApplication);

// Reject application
router.post("/applications/:id/reject", adminCertificateController.rejectApplication);

// ===============================
// 📄 FINAL CERTIFICATES (APPROVED ONLY)
// ===============================

router.get("/certificates", adminCertificateController.listCertificates);

// ===============================
// 📄 ENQUIRY ROUTES
// ===============================

router.get("/enquiries", adminEnquiryController.listEnquiries);
router.get("/enquiries/:id", adminEnquiryController.getEnquiry);
router.post("/enquiries/:id/mark-done", adminEnquiryController.markDone);
router.post("/enquiries/:id/follow-up", adminEnquiryController.followUp);

module.exports = router;