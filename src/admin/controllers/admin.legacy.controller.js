const LegacyCertificate = require("../../models/LegacyCertificate");

const listLegacyCertificates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {};
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { certificateNumber: regex },
        { studentName: regex },
        { course: regex },
        { organization: regex }
      ];
    }

    const [data, total] = await Promise.all([
      LegacyCertificate.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
      LegacyCertificate.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      message: "Legacy certificates retrieved successfully",
      data,
      pagination: {
        page: parsedPage,
        totalPages: Math.max(1, Math.ceil(total / parsedLimit)),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

const getLegacyCertificate = async (req, res, next) => {
  try {
    const { certificateNumber } = req.params;
    const cert = await LegacyCertificate.findOne({ certificateNumber });
    if (!cert) {
      return res.status(404).json({ success: false, message: "Legacy certificate not found" });
    }
    return res.status(200).json({ success: true, data: cert });
  } catch (error) {
    next(error);
  }
};

const updateLegacyCertificate = async (req, res, next) => {
  try {
    const { certificateNumber } = req.params;
    const payload = req.body;

    const cert = await LegacyCertificate.findOne({ certificateNumber });
    if (!cert) {
      return res.status(404).json({ success: false, message: "Legacy certificate not found" });
    }

    const editableFields = ["studentName", "course", "trainingType", "organization", "issueDate", "dateOfBirth", "pdfUrl"];
    editableFields.forEach(field => {
      if (payload[field] !== undefined) {
        if (field === 'issueDate' || field === 'dateOfBirth') {
          cert[field] = payload[field] ? new Date(payload[field]) : null;
        } else {
          cert[field] = payload[field];
        }
      }
    });

    await cert.save();
    return res.status(200).json({ success: true, message: "Legacy certificate updated successfully", data: cert });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listLegacyCertificates,
  getLegacyCertificate,
  updateLegacyCertificate
};
