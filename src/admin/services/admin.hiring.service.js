const HiringRequest = require("../../models/HiringRequest");

const ALLOWED_STATUSES = ["new", "contacted", "hired", "cancelled"];

const parsePagination = (page, limit) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  return { page: parsedPage, limit: parsedLimit, skip: (parsedPage - 1) * parsedLimit };
};

module.exports = {
  async listHiringRequests({ page = 1, limit = 10, search = "", status = "" }) {
    const { skip, page: parsedPage, limit: parsedLimit } = parsePagination(page, limit);
    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { companyName: regex },
        { hrName: regex },
        { mobileNumber: regex },
        { email: regex },
        { techDomain: regex },
        { requestId: regex },
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
      HiringRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
      HiringRequest.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page: parsedPage, totalPages: Math.max(1, Math.ceil(total / parsedLimit)), total },
    };
  },

  async updateHiringStatus(requestId, status, comment) {
    const normalized = (status || "").toLowerCase();
    if (!ALLOWED_STATUSES.includes(normalized)) {
      const err = new Error("Invalid status"); err.statusCode = 400; throw err;
    }
    const request = await HiringRequest.findOne({ requestId });
    if (!request) { const err = new Error("Request not found"); err.statusCode = 404; throw err; }
    request.adminStatus = normalized;
    if (comment !== undefined) request.comment = String(comment || "").trim();
    await request.save();
    return request.toObject();
  },

  async deleteHiringRequest(requestId) {
    const deleted = await HiringRequest.findOneAndDelete({ requestId });
    if (!deleted) { const err = new Error("Request not found"); err.statusCode = 404; throw err; }
  },
};
