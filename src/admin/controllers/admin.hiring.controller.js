const adminHiringService = require("../services/admin.hiring.service");

module.exports = {
  async listHiringRequests(req, res) {
    try {
      const result = await adminHiringService.listHiringRequests(req.query);
      return res.status(200).json({ success: true, message: "Hiring requests fetched", data: result.data, pagination: result.pagination });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to fetch hiring requests" });
    }
  },

  async updateHiringStatus(req, res) {
    try {
      const updated = await adminHiringService.updateHiringStatus(req.params.requestId, req.body?.status, req.body?.comment);
      return res.status(200).json({ success: true, message: "Hiring status updated", data: updated });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message || "Failed to update status" });
    }
  },

  async deleteHiringRequest(req, res) {
    try {
      await adminHiringService.deleteHiringRequest(req.params.requestId);
      return res.status(200).json({ success: true, message: "Hiring request deleted", data: {} });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message || "Failed to delete request" });
    }
  },
};
