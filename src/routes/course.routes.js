const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

router.get("/", async (req, res, next) => {
  try {
    const courses = await Course.find({ active: true }).sort({ name: 1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
