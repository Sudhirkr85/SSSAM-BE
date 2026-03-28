// admin/controllers/admin.enquiry.controller.js

const adminEnquiryService = require("../services/admin.enquiry.service");

module.exports = {
  // 📄 List Enquiries (Pagination + Search)
  async listEnquiries(req, res) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const result = await adminEnquiryService.listEnquiries({
        page,
        limit,
        search,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: error.message || "Failed to fetch enquiries",
      });
    }
  },

  // 📄 Get Single Enquiry
  async getEnquiry(req, res) {
    try {
      const { id } = req.params;

      const enquiry = await adminEnquiryService.getEnquiry(id);

      if (!enquiry) {
        return res.status(404).json({
          message: "Enquiry not found",
        });
      }

      res.json(enquiry);
    } catch (error) {
      res.status(500).json({
        message: error.message || "Failed to fetch enquiry",
      });
    }
  },

  // ✅ Mark Enquiry as Done
  async markDone(req, res) {
    try {
      const { id } = req.params;
      const { comment, interestStatus } = req.body;

      const updated = await adminEnquiryService.markDone(id, {
        comment,
        interestStatus,
      });

      res.json({
        message: "Enquiry marked as done",
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "Failed to mark enquiry as done",
      });
    }
  },

  // 📅 Follow-up Enquiry
  async followUp(req, res) {
    try {
      const { id } = req.params;
      const { followUpDate, comment } = req.body;

      const updated = await adminEnquiryService.followUp(id, {
        followUpDate,
        comment,
      });

      res.json({
        message: "Follow-up scheduled successfully",
        data: updated,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "Failed to schedule follow-up",
      });
    }
  },
};
