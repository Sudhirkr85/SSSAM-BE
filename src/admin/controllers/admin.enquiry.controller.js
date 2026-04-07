const adminEnquiryService = require("../services/admin.enquiry.service");

module.exports = {
  async listEnquiries(req, res) {
    try {
      const result = await adminEnquiryService.listEnquiries(req.query);

      return res.status(200).json({
        success: true,
        message: "Enquiries fetched successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to fetch enquiries",
      });
    }
  },

  async getEnquiry(req, res) {
    try {
      const enquiry = await adminEnquiryService.getEnquiry(req.params.enquiryId);

      return res.status(200).json({
        success: true,
        message: "Enquiry fetched successfully",
        data: enquiry,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to fetch enquiry",
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const updated = await adminEnquiryService.updateStatus(
        req.params.enquiryId,
        req.body?.status,
      );

      return res.status(200).json({
        success: true,
        message: "Enquiry status updated successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || "Failed to update enquiry status",
      });
    }
  },

  async followUp(req, res) {
    try {
      const updated = await adminEnquiryService.followUp(req.params.enquiryId, req.body);

      return res.status(200).json({
        success: true,
        message: "Follow-up scheduled successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || "Failed to schedule follow-up",
      });
    }
  },

  async closeEnquiry(req, res) {
    try {
      const updated = await adminEnquiryService.closeEnquiry(
        req.params.enquiryId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Enquiry closed successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || "Failed to close enquiry",
      });
    }
  },

  async deleteEnquiry(req, res) {
    try {
      await adminEnquiryService.deleteEnquiry(req.params.enquiryId);

      return res.status(200).json({
        success: true,
        message: "Enquiry deleted successfully",
        data: {},
      });
    } catch (error) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || "Failed to delete enquiry",
      });
    }
  },
};
