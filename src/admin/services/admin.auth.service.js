const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const login = async ({ username, password }) => {
  const configuredUsername = process.env.ADMIN_USERNAME || "admin";
  const configuredPassword = process.env.ADMIN_PASSWORD || "123456";
  const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const jwtSecret = process.env.ADMIN_JWT_SECRET || "replace-with-strong-random-secret";
  const jwtExpiresIn = process.env.ADMIN_JWT_EXPIRES_IN || "30d";

  const usernameValid = safeCompare(username, configuredUsername);
  let passwordValid = false;

  if (configuredPasswordHash) {
    passwordValid = await bcrypt.compare(password, configuredPasswordHash);
  } else {
    passwordValid = safeCompare(password, configuredPassword);
  }

  if (!usernameValid || !passwordValid) {
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
