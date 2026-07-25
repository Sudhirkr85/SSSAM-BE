const {
  submitEnquiry,
  getEnquiryStatus,
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} = require("../services/enquiry.service");

const { sendSuccess } = require("../utils/response");
const { sendAdminEmail } = require("../services/emailService");

const formatIndianDateTime = (date) => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(new Date(date));
};

const CRM_PUBLIC_ENQUIRY_URL =
  process.env.CRM_PUBLIC_ENQUIRY_URL ||
  "https://sssam-r3pz.onrender.com/api/enquiries/public";

const syncEnquiryToCRM = async (payload) => {
  const courseName =
    payload.course === "Others" && payload.customCourseName
      ? payload.customCourseName
      : payload.course;

  const crmPayload = {
    name: payload.fullName,
    mobile: payload.phoneNumber,
    course: courseName,
  };

  if (payload.email) {
    crmPayload.email = payload.email;
  }

  const response = await fetch(CRM_PUBLIC_ENQUIRY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(crmPayload),
  });

  await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
};

// ===============================
// CREATE ENQUIRY
// ===============================
const createEnquiry = async (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  let enquiry = null;

  // ✅ Save to DB (independent)
  try {
    enquiry = await submitEnquiry(req.body, ipAddress);
  } catch (error) {
    console.error("❌ DB Error:", error.message);
  }

  // ✅ CRM Sync enabled
  syncEnquiryToCRM(req.body).catch((error) =>
    console.error("CRM Sync Error", error.message),
  );

  // ✅ FIXED PAYLOAD (NO UNDEFINED)
  const emailData = {
    name: req.body.fullName || "N/A",
    email: req.body.email || "N/A",
    phoneNumber: req.body.phoneNumber || "N/A",
    course: req.body.course || "N/A",
    certificateType: "Enquiry",
    duration: req.body.demoType || "N/A",
    date: formatIndianDateTime(new Date()),

    subject: enquiry
      ? "SSSAM - New Enquiry Received"
      : "⚠️ SSSAM - Enquiry (DB Failed)",
  };

  // ✅ Send email (non-blocking)
  sendAdminEmail(emailData).catch((err) =>
    console.error("❌ Email Error:", err.message),
  );

  // ✅ Response
  return sendSuccess(res, 201, {
    message: "Enquiry submitted successfully",
    enquiryId: enquiry?.enquiryId || null,
    status: enquiry?.status || "Pending",
  });
};

// ===============================
// OTHER CONTROLLERS (NO CHANGE)
// ===============================
const getEnquiryStatusById = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;
    const enquiry = await getEnquiryStatus(enquiryId);

    return sendSuccess(res, 200, enquiry);
  } catch (error) {
    return next(error);
  }
};

const listAllEnquiries = async (req, res, next) => {
  try {
    const enquiries = await getAllEnquiries();
    return sendSuccess(res, 200, enquiries);
  } catch (error) {
    return next(error);
  }
};

const updateEnquiry = async (req, res, next) => {
  try {
    const enquiry = await updateEnquiryStatus(
      req.params.enquiryId,
      req.body.status,
    );
    return sendSuccess(res, 200, enquiry);
  } catch (error) {
    return next(error);
  }
};

const removeEnquiry = async (req, res, next) => {
  try {
    await deleteEnquiry(req.params.enquiryId);
    return sendSuccess(res, 200, { message: "Deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createEnquiry,
  getEnquiryStatusById,
  listAllEnquiries,
  updateEnquiry,
  removeEnquiry,
};
