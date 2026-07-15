const Course = require("../../models/Course");

const listCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = "", category = "" } = req.query;
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }

    const [data, total] = await Promise.all([
      Course.find(query).sort({ name: 1 }).skip(skip).limit(parsedLimit).lean(),
      Course.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data,
      pagination: {
        page: parsedPage,
        totalPages: Math.max(1, Math.ceil(total / parsedLimit)),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { name, category, active = true } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: "Name and Category are required" });
    }

    const existing = await Course.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Course already exists" });
    }

    const course = await Course.create({
      name: name.trim(),
      category: category.trim(),
      active
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, active } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (name !== undefined) course.name = name.trim();
    if (category !== undefined) course.category = category.trim();
    if (active !== undefined) course.active = active;

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCourses,
  createCourse,
  updateCourse
};
