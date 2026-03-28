// admin/services/admin.enquiry.service.js

const Enquiry = require("../../models/Enquiry");
const { Types } = require("mongoose");

// 🔍 Search Query Builder
function buildSearchQuery(search) {
  if (!search) return {};

  return {
    fullName: { $regex: search, $options: "i" },
  };
}

module.exports = {
  // 📄 List Enquiries (Pagination + Search)
  async listEnquiries({ page = 1, limit = 10, search = "" }) {
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    const skip = (parsedPage - 1) * parsedLimit;
    const query = buildSearchQuery(search);

    const [data, total] = await Promise.all([
      Enquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),

      Enquiry.countDocuments(query),
    ]);

    return {
      data,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
    };
  },

  // 📄 Get Single Enquiry
  async getEnquiry(id) {
    if (!Types.ObjectId.isValid(id)) return null;

    return Enquiry.findById(id);
  },

  // ✅ Mark Enquiry as Done
  async markDone(id, { comment, interestStatus }) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid Enquiry ID");
    }

    if (!comment || !interestStatus) {
      throw new Error("Comment and interestStatus are required");
    }

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      throw new Error("Enquiry not found");
    }

    if (enquiry.adminStatus === "done") {
      throw new Error("Enquiry already marked as done");
    }

    enquiry.adminStatus = "done";
    enquiry.comment = comment;
    enquiry.interestStatus = interestStatus;

    await enquiry.save();

    return enquiry;
  },

  // 📅 Follow-up Enquiry
  async followUp(id, { followUpDate, comment }) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid Enquiry ID");
    }

    if (!followUpDate) {
      throw new Error("Follow-up date is required");
    }

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      throw new Error("Enquiry not found");
    }

    if (enquiry.adminStatus === "done") {
      throw new Error("Cannot follow up a completed enquiry");
    }

    enquiry.adminStatus = "follow_up";
    enquiry.followUpDate = followUpDate;
    enquiry.comment = comment;

    await enquiry.save();

    return enquiry;
  },
};
