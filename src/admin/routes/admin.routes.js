const express = require("express");
const authMiddleware = require("../../middleware/auth");
const adminAuthController = require("../controllers/admin.auth.controller");
const adminCertificateController = require("../controllers/admin.certificate.controller");
const adminEnquiryController = require("../controllers/admin.enquiry.controller");
const adminPlacementController = require("../../controllers/placement.controller");
const adminBlogController = require("../../controllers/blog.controller");
const adminNotesController = require("../../controllers/notes.controller");
const upload = require("../../middlewares/upload");

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

// Admin Placements routes
router.get("/placements", adminPlacementController.getAdminPlacements);
router.post(
  "/placements",
  upload.fields([{ name: "photo", maxCount: 1 }, { name: "companyLogo", maxCount: 1 }]),
  adminPlacementController.createPlacement
);
router.put(
  "/placements/:id",
  upload.fields([{ name: "photo", maxCount: 1 }, { name: "companyLogo", maxCount: 1 }]),
  adminPlacementController.updatePlacement
);
router.delete("/placements/:id", adminPlacementController.deletePlacement);

// Admin Blogs / Hiring routes
router.get("/blogs", adminBlogController.getAdminBlogs);
router.post("/blogs/generate-ai", adminBlogController.generateAIBlog);
router.post("/blogs", upload.single("image"), adminBlogController.createBlog);
router.put("/blogs/:id", upload.single("image"), adminBlogController.updateBlog);
router.delete("/blogs/:id", adminBlogController.deleteBlog);

// Admin Study Notes routes
router.get("/notes", adminNotesController.getAdminNotes);
router.post("/notes", upload.single("file"), adminNotesController.createNote);
router.put("/notes/:id", upload.single("file"), adminNotesController.updateNote);
router.delete("/notes/:id", adminNotesController.deleteNote);

// Admin general settings route
const settingsController = require("../../controllers/settings.controller");
router.post("/settings", settingsController.updateSetting);

module.exports = router;