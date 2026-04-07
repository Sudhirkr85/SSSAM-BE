const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const login = async ({ username, password }) => {
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.ADMIN_JWT_SECRET;
  const jwtExpiresIn = process.env.ADMIN_JWT_EXPIRES_IN || "30d";

  if (!configuredUsername || !configuredPassword || !jwtSecret) {
    const error = new Error("Admin login is not configured");
    error.statusCode = 500;
    throw error;
  }

  const isValid =
    safeCompare(username, configuredUsername) &&
    safeCompare(password, configuredPassword);

  if (!isValid) {
    const error = new Error("Invalid admin credentials");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      username: configuredUsername,
      role: "admin",
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );

  return {
    token,
    tokenType: "Bearer",
    expiresIn: jwtExpiresIn,
  };
};

module.exports = {
  login,
};
