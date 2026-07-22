const express = require("express");
const router = express.Router();
const { createHiringRequest } = require("../controllers/hiring.controller");
const { hiringRequestSchema, validate } = require("../validators/hiring.validator");
const rateLimit = require("express-rate-limit");

const hiringLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: "Too many hiring requests. Please try again after 15 minutes." },
});

router.post("/book", hiringLimiter, validate(hiringRequestSchema), createHiringRequest);

module.exports = router;
