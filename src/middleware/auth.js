const jwt = require("jsonwebtoken");

const unauthorized = (res, message = "Unauthorized") => {
  return res.status(401).json({
    success: false,
    message,
  });
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized(res, "Missing or invalid authorization header");
  }

  const token = authHeader.slice(7).trim();

  try {
    const secret = process.env.ADMIN_JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Admin auth is not configured",
      });
    }

    const decoded = jwt.verify(token, secret);

    req.admin = {
      username: decoded.username,
      role: decoded.role,
    };

    return next();
  } catch (_error) {
    return unauthorized(res, "Invalid or expired token");
  }
};

module.exports = authMiddleware;
