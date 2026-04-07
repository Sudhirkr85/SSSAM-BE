const adminAuthService = require("../services/admin.auth.service");

const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username and password are required",
      });
    }

    const data = await adminAuthService.login({ username, password });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to login",
    });
  }
};

module.exports = {
  login,
};
