const rateLimit = require('express-rate-limit');

// Rate limiter for certificate applications
// Max 10 requests per IP within 20 minutes
const applyLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many applications from this IP, please try again after 20 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    // Use IP address as the key
    return req.ip || req.connection.remoteAddress;
  },
  skip: (req, res) => {
    // Skip rate limiting for non-POST requests to /apply
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

module.exports = applyLimiter;
