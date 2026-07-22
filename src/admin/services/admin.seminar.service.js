const SeminarBooking = require("../../models/SeminarBooking");

const ALLOWED_STATUSES = ["new", "contacted", "scheduled", "cancelled"];

const parsePagination = (page, limit) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  return { page: parsedPage, limit: parsedLimit, skip: (parsedPage - 1) * parsedLimit };
};

module.exports = {
  async listSeminarBookings({ page = 1, limit = 10, search = "", status = "" }) {
    const { skip, page: parsedPage, limit: parsedLimit } = parsePagination(page, limit);
    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { collegeName: regex },
        { coordinatorName: regex },
        { mobileNumber: regex },
        { topic: regex },
        { bookingId: regex },
      ];
    }

    if (status) {
      const normalized = status.toLowerCase();
      if (!ALLOWED_STATUSES.includes(normalized)) {
        const err = new Error("Invalid status filter"); err.statusCode = 400; throw err;
      }
      query.adminStatus = normalized;
    }

    const [data, total] = await Promise.all([
      SeminarBooking.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
      SeminarBooking.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page: parsedPage, totalPages: Math.max(1, Math.ceil(total / parsedLimit)), total },
    };
  },

  async updateSeminarStatus(bookingId, status, comment) {
    const normalized = (status || "").toLowerCase();
    if (!ALLOWED_STATUSES.includes(normalized)) {
      const err = new Error("Invalid status"); err.statusCode = 400; throw err;
    }
    const booking = await SeminarBooking.findOne({ bookingId });
    if (!booking) { const err = new Error("Booking not found"); err.statusCode = 404; throw err; }
    booking.adminStatus = normalized;
    if (comment !== undefined) booking.comment = String(comment || "").trim();
    await booking.save();
    return booking.toObject();
  },

  async deleteSeminarBooking(bookingId) {
    const deleted = await SeminarBooking.findOneAndDelete({ bookingId });
    if (!deleted) { const err = new Error("Booking not found"); err.statusCode = 404; throw err; }
  },
};
