const { submitHiringRequest } = require("../services/hiring.service");
const { sendHiringEmails } = require("../services/emailService");

const formatIndianDateTime = (date) => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
};

const createHiringRequest = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  let request = null;

  try {
    request = await submitHiringRequest(req.body, ipAddress);
  } catch (error) {
    console.error("❌ DB Error (hiring):", error.message);
  }

  // Send emails asynchronously (setImmediate guarantees zero API response delay)
  setImmediate(() => {
    sendHiringEmails({
      companyName: req.body.companyName,
      hrName: req.body.hrName,
      mobileNumber: req.body.mobileNumber,
      email: req.body.email,
      techDomain: req.body.techDomain,
      requestId: request?.requestId || "N/A",
      date: formatIndianDateTime(new Date()),
    }).catch((err) => console.error("❌ Email Error (hiring):", err.message));
  });

  return res.status(201).json({
    success: true,
    message: "Hiring request submitted successfully",
    requestId: request?.requestId || null,
  });
};

module.exports = { createHiringRequest };
