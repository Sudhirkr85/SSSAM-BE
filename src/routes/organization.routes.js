const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization");

router.get("/", async (req, res, next) => {
  try {
    const organizations = await Organization.find({ active: true }).sort({ name: 1 });
    res.json(organizations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
