const rateLimit = require('express-rate-limit');

// Rate limiter for enquiries
// Max 10 requests per IP within 20 minutes
const enquiryLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many enquiries from this IP, please try again after 20 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  },
  skip: (req, res) => {
    return req.method !== 'POST';
  },
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json({
      success: false,
      statusCode: options.statusCode,
      message: options.message
    });
  }
});

module.exports = enquiryLimiter;
