const Enquiry = require("../../models/Enquiry");

const ALLOWED_ADMIN_STATUSES = [
  "new",
  "contacted",
  "follow_up",
  "converted",
  "rejected",
];
const ALLOWED_INTEREST_STATUSES = ["interested", "not_interested"];

const parsePagination = (page, limit) => {
  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const getEnquiryByHumanId = async (enquiryId) => {
  if (!enquiryId) {
    const error = new Error("enquiryId is required");
    error.statusCode = 400;
    throw error;
  }

  const enquiry = await Enquiry.findOne({ enquiryId });

  if (!enquiry) {
    const error = new Error("Enquiry not found");
    error.statusCode = 404;
    throw error;
  }

  return enquiry;
};

const buildQuery = ({ search, status }) => {
  const query = {};

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { fullName: regex },
      { email: regex },
      { phoneNumber: regex },
      { message: regex },
      { course: regex },
    ];
  }

  if (status) {
    const normalizedStatus = normalize(status);
    if (!ALLOWED_ADMIN_STATUSES.includes(normalizedStatus)) {
      const error = new Error("Invalid status filter");
      error.statusCode = 400;
      throw error;
    }
    query.adminStatus = normalizedStatus;
  }

  return query;
};

module.exports = {
  async listEnquiries({ page = 1, limit = 10, search = "", status = "" }) {
    const { skip, page: parsedPage, limit: parsedLimit } = parsePagination(page, limit);
    const query = buildQuery({ search, status });

    const [data, total] = await Promise.all([
      Enquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Enquiry.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page: parsedPage,
        totalPages: Math.max(1, Math.ceil(total / parsedLimit)),
        total,
      },
    };
  },

  async getEnquiry(enquiryId) {
    const enquiry = await getEnquiryByHumanId(enquiryId);
    return enquiry.toObject();
  },

  async updateStatus(enquiryId, status) {
    const normalizedStatus = normalize(status);
    const publicStatuses = ["pending", "scheduled", "completed", "cancelled"];
    const adminStatuses = ["new", "contacted", "follow_up", "converted", "rejected"];

    if (!publicStatuses.includes(normalizedStatus) && !adminStatuses.includes(normalizedStatus)) {
      const error = new Error(
        "status must be one of Pending, Scheduled, Completed, Cancelled, new, contacted, follow_up, converted, rejected",
      );
      error.statusCode = 400;
      throw error;
    }

    const enquiry = await getEnquiryByHumanId(enquiryId);

    if (publicStatuses.includes(normalizedStatus)) {
      enquiry.status = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
    } else {
      enquiry.adminStatus = normalizedStatus;
    }

    await enquiry.save();

    return enquiry.toObject();
  },

  async followUp(enquiryId, { followUpDate, comment }) {
    if (!followUpDate) {
      const error = new Error("followUpDate is required");
      error.statusCode = 400;
      throw error;
    }

    const parsedDate = new Date(followUpDate);
    if (Number.isNaN(parsedDate.getTime())) {
      const error = new Error("followUpDate must be a valid ISO date");
      error.statusCode = 400;
      throw error;
    }

    const enquiry = await getEnquiryByHumanId(enquiryId);
    enquiry.adminStatus = "follow_up";
    enquiry.followUpDate = parsedDate;
    if (comment !== undefined) {
      enquiry.comment = String(comment || "").trim();
    }
    await enquiry.save();

    return enquiry.toObject();
  },

  async closeEnquiry(enquiryId, { comment, interestStatus }) {
    const normalizedInterestStatus = normalize(interestStatus);
    if (!ALLOWED_INTEREST_STATUSES.includes(normalizedInterestStatus)) {
      const error = new Error("interestStatus must be interested or not_interested");
      error.statusCode = 400;
      throw error;
    }

    const enquiry = await getEnquiryByHumanId(enquiryId);
    enquiry.interestStatus = normalizedInterestStatus;
    enquiry.adminStatus =
      normalizedInterestStatus === "interested" ? "converted" : "rejected";
    enquiry.comment = String(comment || "").trim();
    await enquiry.save();

    return enquiry.toObject();
  },

  async deleteEnquiry(enquiryId) {
    const deleted = await Enquiry.findOneAndDelete({ enquiryId });

    if (!deleted) {
      const error = new Error("Enquiry not found");
      error.statusCode = 404;
      throw error;
    }
  },
};
