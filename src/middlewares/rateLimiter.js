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

// Rate limiter for certificate downloads (prevents brute-force)
// Max 5 attempts per IP per 15 minutes
const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many download attempts from this IP, please try again after 15 minutes',
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

module.exports = {
  applyLimiter,
  downloadLimiter
};
