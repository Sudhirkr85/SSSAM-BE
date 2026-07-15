const CertificateApplication = require("../../models/CertificateApplication");
const CertificateRecord = require("../../models/CertificateRecord");
const { generateCertificateNumber } = require("../../utils/certNumber");
const { sendStudentEmail } = require("../../services/emailService");

const formatIndianDate = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

const APP_ALLOWED_STATUSES = ["pending", "approved", "rejected"];

const parsePagination = (page, limit) => {
  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

const normalizeStatus = (statusValue) => {
  return String(statusValue || "").trim().toLowerCase();
};

const validateApplicationStatusFilter = (status) => {
  if (!status) {
    return null;
  }

  const normalized = normalizeStatus(status);

  if (!APP_ALLOWED_STATUSES.includes(normalized)) {
    const error = new Error("Invalid status filter");
    error.statusCode = 400;
    throw error;
  }

  return normalized;
};

const buildApplicationQuery = ({ search, status }) => {
  const query = {};

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phoneNumber: searchRegex },
    ];
  }

  const normalizedStatus = validateApplicationStatusFilter(status);
  if (normalizedStatus) {
    query.status = new RegExp(`^${normalizedStatus}$`, "i");
  }

  return query;
};

const buildCertificateSearchMatch = (search) => {
  if (!search) {
    return {};
  }

  const searchRegex = new RegExp(search, "i");
  return {
    $or: [
      { fullName: searchRegex },
      { certificateNumber: searchRegex },
      { "application.email": searchRegex },
      { "application.phoneNumber": searchRegex },
    ],
  };
};

const getApplicationByHumanId = async (applicationId) => {
  if (!applicationId) {
    const error = new Error("applicationId is required");
    error.statusCode = 400;
    throw error;
  }

  const application = await CertificateApplication.findOne({ applicationId });

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  return application;
};

const buildCertificatePayloadFromApplication = (application) => {
  return {
    certificateNumber: application.certificateNumber,
    fullName: application.fullName,
    dateOfBirth: application.dateOfBirth,
    course: application.course,
    certificateType: application.certificateType,
    duration: application.duration,
    issueDate: application.issueDate,
    instituteName: "SSSAM Academy",
    status: "Verified",
    applicationId: application._id,
  };
};

module.exports = {
  async listApplications({ page = 1, limit = 10, search = "", status = "" }) {
    const { skip, page: parsedPage, limit: parsedLimit } = parsePagination(page, limit);
    const query = buildApplicationQuery({ search, status });

    const [data, total] = await Promise.all([
      CertificateApplication.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      CertificateApplication.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page: parsedPage,
        totalPages: Math.max(1, Math.ceil(total / parsedLimit)),
        total,
      },
    };
  },

  async getApplication(applicationId) {
    const application = await getApplicationByHumanId(applicationId);
    return application.toObject();
  },

  async approveApplication(applicationId) {
    const application = await getApplicationByHumanId(applicationId);

    if (normalizeStatus(application.status) !== "pending") {
      const error = new Error("Only pending applications can be approved");
      error.statusCode = 400;
      throw error;
    }

    if (!application.certificateNumber) {
      application.certificateNumber = await generateCertificateNumber();
    }

    application.status = "Approved";
    application.issueDate = new Date();

    await application.save();

    // Generate PDF
    const { generateCertificatePdf } = require("../../services/pdf.service");
    const fs = require("fs").promises;
    const path = require("path");

    const pdfBuffer = await generateCertificatePdf({
      certificateNumber: application.certificateNumber,
      fullName: application.fullName,
      dateOfBirth: application.dateOfBirth,
      course: application.course,
      certificateType: application.certificateType,
      duration: application.duration,
      issueDate: application.issueDate,
    });

    const filename = `certificate-${application.certificateNumber.replace(/\//g, "_")}.pdf`;
    const uploadDir = path.resolve(__dirname, "../../../uploads/certificates");
    await fs.mkdir(uploadDir, { recursive: true });
    const pdfPath = path.join(uploadDir, filename);
    await fs.writeFile(pdfPath, pdfBuffer);

    // Relational file path for serving / static access
    const relativePdfPath = `/uploads/certificates/${filename}`;

    const certPayload = buildCertificatePayloadFromApplication(application);
    certPayload.pdfPath = relativePdfPath;

    await CertificateRecord.updateOne(
      { certificateNumber: application.certificateNumber },
      certPayload,
      { upsert: true },
    );

    // Send approval email to student (non-blocking)
    setImmediate(async () => {
      try {
        await sendStudentEmail({
          name: application.fullName,
          email: application.email,
          course: application.course,
          certificateType: application.certificateType,
          applicationId: application.applicationId,
          certificateNumber: application.certificateNumber,
          duration: application.duration,
          status: "Approved",
          subject: "Application Approved - SSSAM Academy",
          statusMessage: "Your certificate has been generated.",
          date: formatIndianDate(application.issueDate),
        });
        console.log("✅ Approval email sent");
      } catch (err) {
        console.error("❌ Approval email failed:", err.message);
      }
    });

    return application.toObject();
  },

  async rejectApplication(applicationId, reason) {
    if (!reason || !String(reason).trim()) {
      const error = new Error("reason is required");
      error.statusCode = 400;
      throw error;
    }

    const application = await getApplicationByHumanId(applicationId);

    if (normalizeStatus(application.status) !== "pending") {
      const error = new Error("Only pending applications can be rejected");
      error.statusCode = 400;
      throw error;
    }

    application.status = "Rejected";
    application.rejectionReason = String(reason).trim();
    await application.save();

    // Send rejection email to student (non-blocking)
    setImmediate(async () => {
      try {
        await sendStudentEmail({
          name: application.fullName,
          email: application.email,
          course: application.course,
          certificateType: application.certificateType,
          applicationId: application.applicationId,
          duration: application.duration,
          status: "Rejected",
          subject: "Application Rejected - SSSAM Academy",
          statusMessage: `Your application has been rejected. Reason: ${application.rejectionReason}`,
          date: formatIndianDate(new Date()),
        });
        console.log("✅ Rejection email sent");
      } catch (err) {
        console.error("❌ Rejection email failed:", err.message);
      }
    });

    return application.toObject();
  },

  async updateApplication(applicationId, payload = {}) {
    const application = await getApplicationByHumanId(applicationId);

    const allowedUpdates = {
      fullName: payload.fullName || payload.name,
      email: payload.email,
      phoneNumber: payload.phoneNumber || payload.phone,
      dateOfBirth: payload.dateOfBirth || payload.dob,
      qualification: payload.qualification,
      course: payload.course,
      organization: payload.organization,
      certificateType: payload.certificateType,
      duration: payload.duration,
      durationDates: payload.durationDates,
      issueDate: payload.issueDate,
    };

    const updates = Object.entries(allowedUpdates).filter(
      ([, value]) => value !== undefined
    );

    if (!updates.length) {
      const error = new Error("No valid fields provided for update");
      error.statusCode = 400;
      throw error;
    }

    updates.forEach(([key, value]) => {
      if (key === "dateOfBirth" || key === "issueDate") {
        application[key] = (value === null || value === "") ? null : new Date(value);
      } else {
        application[key] = (value === null || value === "") ? "" : String(value).trim();
      }
    });

    // Handle compound courses/durations matching apply logic
    if (payload.organization !== undefined || payload.course !== undefined) {
      const baseCourse = payload.course !== undefined ? payload.course : (application.course || "").split(" (")[0];
      const org = payload.organization !== undefined ? payload.organization : application.organization;
      if (org) {
        application.course = `${baseCourse} (${org})`;
      } else {
        application.course = baseCourse;
      }
    }

    if (payload.durationDates !== undefined || payload.duration !== undefined) {
      const baseDuration = payload.duration !== undefined ? payload.duration : (application.duration || "").split(" | Duration: ")[0];
      const dates = payload.durationDates !== undefined ? payload.durationDates : application.durationDates;
      if (dates) {
        application.duration = `${baseDuration} | Duration: ${dates}`;
      } else {
        application.duration = baseDuration;
      }
    }

    await application.save();

    // If it's already approved, regenerate PDF and update certificate record
    if (normalizeStatus(application.status) === "approved") {
      const { generateCertificatePdf } = require("../../services/pdf.service");
      const fs = require("fs").promises;
      const path = require("path");

      const pdfBuffer = await generateCertificatePdf({
        certificateNumber: application.certificateNumber,
        fullName: application.fullName,
        dateOfBirth: application.dateOfBirth,
        course: application.course,
        certificateType: application.certificateType,
        duration: application.duration,
        issueDate: application.issueDate,
      });

      const filename = `certificate-${application.certificateNumber.replace(/\//g, "_")}.pdf`;
      const uploadDir = path.resolve(__dirname, "../../../uploads/certificates");
      await fs.mkdir(uploadDir, { recursive: true });
      const pdfPath = path.join(uploadDir, filename);
      await fs.writeFile(pdfPath, pdfBuffer);

      const relativePdfPath = `/uploads/certificates/${filename}`;
      const certPayload = buildCertificatePayloadFromApplication(application);
      certPayload.pdfPath = relativePdfPath;

      await CertificateRecord.updateOne(
        { certificateNumber: application.certificateNumber },
        certPayload,
        { upsert: true }
      );
    }

    return application.toObject();
  },

  async listCertificates({ page = 1, limit = 10, search = "", status = "" }) {
    const { skip, page: parsedPage, limit: parsedLimit } = parsePagination(page, limit);

    const statusMatch = status
      ? { status: new RegExp(`^${String(status).trim()}$`, "i") }
      : {};

    const searchMatch = buildCertificateSearchMatch(search);

    const pipeline = [
      {
        $lookup: {
          from: "certificateapplications",
          localField: "applicationId",
          foreignField: "_id",
          as: "application",
        },
      },
      {
        $unwind: {
          path: "$application",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          ...statusMatch,
          ...searchMatch,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: parsedLimit },
          ],
          meta: [{ $count: "total" }],
        },
      },
    ];

    const [result] = await CertificateRecord.aggregate(pipeline);
    const total = result?.meta?.[0]?.total || 0;

    return {
      data: result?.data || [],
      pagination: {
        page: parsedPage,
        totalPages: Math.max(1, Math.ceil(total / parsedLimit)),
        total,
      },
    };
  },

  async updateCertificate(certificateNumber, payload = {}) {
    if (!certificateNumber) {
      const error = new Error("certificateNumber is required");
      error.statusCode = 400;
      throw error;
    }

    const certificate = await CertificateRecord.findOne({ certificateNumber });

    if (!certificate) {
      const error = new Error("Certificate not found");
      error.statusCode = 404;
      throw error;
    }

    const editableFields = [
      "fullName",
      "course",
      "duration",
      "certificateType",
      "status",
      "instituteName",
      "issueDate",
      "dateOfBirth",
    ];

    let hasUpdate = false;
    editableFields.forEach((field) => {
      if (payload[field] !== undefined) {
        certificate[field] = payload[field];
        hasUpdate = true;
      }
    });

    if (!hasUpdate) {
      const error = new Error("No valid fields provided for update");
      error.statusCode = 400;
      throw error;
    }

    await certificate.save();

    await CertificateApplication.updateOne(
      { _id: certificate.applicationId },
      {
        $set: {
          ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
          ...(payload.course !== undefined ? { course: payload.course } : {}),
          ...(payload.duration !== undefined ? { duration: payload.duration } : {}),
          ...(payload.issueDate !== undefined ? { issueDate: payload.issueDate } : {}),
          ...(payload.dateOfBirth !== undefined ? { dateOfBirth: payload.dateOfBirth } : {}),
        },
      },
    );

    return certificate.toObject();
  },
};
