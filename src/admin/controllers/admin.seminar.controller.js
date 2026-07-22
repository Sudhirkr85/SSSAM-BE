const adminSeminarService = require("../services/admin.seminar.service");

module.exports = {
  async listSeminarBookings(req, res) {
    try {
      const result = await adminSeminarService.listSeminarBookings(req.query);
      return res.status(200).json({ success: true, message: "Seminar bookings fetched", data: result.data, pagination: result.pagination });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to fetch seminar bookings" });
    }
  },

  async updateSeminarStatus(req, res) {
    try {
      const updated = await adminSeminarService.updateSeminarStatus(req.params.bookingId, req.body?.status, req.body?.comment);
      return res.status(200).json({ success: true, message: "Seminar status updated", data: updated });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message || "Failed to update status" });
    }
  },

  async deleteSeminarBooking(req, res) {
    try {
      await adminSeminarService.deleteSeminarBooking(req.params.bookingId);
      return res.status(200).json({ success: true, message: "Seminar booking deleted", data: {} });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message || "Failed to delete booking" });
    }
  },
};
