const express = require("express");
const router = express.Router();
const { createSeminarBooking } = require("../controllers/seminar.controller");
const { seminarBookingSchema, validate } = require("../validators/seminar.validator");
const rateLimit = require("express-rate-limit");

const seminarLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: "Too many seminar requests. Please try again after 15 minutes." },
});

router.post("/book", seminarLimiter, validate(seminarBookingSchema), createSeminarBooking);

module.exports = router;
