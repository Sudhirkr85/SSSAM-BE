const { submitSeminarBooking } = require("../services/seminar.service");
const { sendSeminarEmails } = require("../services/emailService");

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

const createSeminarBooking = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  let booking = null;

  try {
    booking = await submitSeminarBooking(req.body, ipAddress);
  } catch (error) {
    console.error("❌ DB Error (seminar):", error.message);
  }

  // Send emails (non-blocking)
  sendSeminarEmails({
    collegeName: req.body.collegeName,
    coordinatorName: req.body.coordinatorName,
    mobileNumber: req.body.mobileNumber,
    email: req.body.email || null,
    topic: req.body.topic,
    bookingId: booking?.bookingId || "N/A",
    date: formatIndianDateTime(new Date()),
  }).catch((err) => console.error("❌ Email Error (seminar):", err.message));

  return res.status(201).json({
    success: true,
    message: "Seminar request submitted successfully",
    bookingId: booking?.bookingId || null,
  });
};

module.exports = { createSeminarBooking };
