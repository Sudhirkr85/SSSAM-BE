const Organization = require("../../models/Organization");

const listOrganizations = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query;
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [data, total] = await Promise.all([
      Organization.find(query).sort({ name: 1 }).skip(skip).limit(parsedLimit).lean(),
      Organization.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Organizations retrieved successfully",
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

const createOrganization = async (req, res, next) => {
  try {
    const { name, active = true } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Organization Name is required" });
    }

    const existing = await Organization.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Organization already exists" });
    }

    const org = await Organization.create({
      name: name.trim(),
      active
    });

    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: org
    });
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;

    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    if (name !== undefined) org.name = name.trim();
    if (active !== undefined) org.active = active;

    await org.save();

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: org
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listOrganizations,
  createOrganization,
  updateOrganization
};
