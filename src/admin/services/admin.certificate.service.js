const CertificateApplication = require("../../models/CertificateApplication");
const CertificateRecord = require("../../models/CertificateRecord");
const { Types } = require("mongoose");
const { sendStudentEmail } = require("../../services/emailService");

// 🇮🇳 Indian Date
const formatIndianDate = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};
// 🔍 Search
function buildSearchQuery(search) {
  if (!search) return {};
  return {
    fullName: { $regex: search, $options: "i" },
  };
}

// ✅ Non-blocking email
const sendEmailAsync = (fn) => {
  setImmediate(async () => {
    try {
      await fn();
      console.log("✅ Email sent");
    } catch (err) {
      console.error("❌ Email failed:", err.message);
    }
  });
};

module.exports = {
  // =========================
  // 📄 APPLICATION LIST
  // =========================
  async listApplications({ page = 1, limit = 10, search = "" }) {
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    const skip = (parsedPage - 1) * parsedLimit;
    const query = buildSearchQuery(search);

    const [data, total] = await Promise.all([
      CertificateApplication.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),

      CertificateApplication.countDocuments(query),
    ]);

    return {
      data,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
    };
  },

  // =========================
  // 📄 SINGLE APPLICATION
  // =========================
  async getApplication(id) {
    if (!Types.ObjectId.isValid(id)) return null;
    return CertificateApplication.findById(id);
  },

  // =========================
  // ✏️ UPDATE (ONLY PENDING)
  // =========================
  async updateApplication(id, updateData) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID");
    }

    const app = await CertificateApplication.findById(id);

    if (!app) throw new Error("Application not found");

    if (app.status !== "Pending") {
      throw new Error("Only pending applications can be edited");
    }

    Object.assign(app, updateData);
    await app.save();

    return app;
  },

  // =========================
  // ✅ APPROVE
  // =========================
  async approveApplication(id) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID");
    }

    const app = await CertificateApplication.findById(id);

    if (!app) throw new Error("Application not found");

    if (app.status !== "Pending") {
      throw new Error("Only pending applications can be approved");
    }

    app.status = "Approved";
    app.issueDate = new Date();

    await app.save();

    // Create certificate record
    await CertificateRecord.updateOne(
      { certificateNumber: app.certificateNumber },
      {
        certificateNumber: app.certificateNumber,
        fullName: app.fullName,
        dateOfBirth: app.dateOfBirth,
        course: app.course,
        certificateType: app.certificateType,
        duration: app.duration,
        issueDate: app.issueDate,
        instituteName: "SSSAM Academy",
        status: "Verified",
        applicationId: app._id,
      },
      { upsert: true },
    );

    return app;
  },

  // =========================
  // ❌ REJECT
  // =========================
  async rejectApplication(id, reason) {
    if (!id) {
      throw new Error("Application ID required");
    }
    if (!reason) throw new Error("Rejection reason required");

    // Find by applicationId (string)
    const app = await CertificateApplication.findOne({ applicationId: id });

    if (!app) throw new Error("Application not found");

    if (app.status !== "Pending") {
      throw new Error("Only pending applications can be rejected");
    }

    app.status = "Rejected";
    app.rejectionReason = reason;

    const application = await app.save();
    // 📧 Email
    sendEmailAsync(() =>
      sendStudentEmail({
        name: application?.fullName || "",
        email: application?.email || "",
        course: application?.course || "",
        status: "Rejected",
        subject: "Application Rejected - SSSAM Academy",
        statusMessage: "Your application has been rejected.",
        reason,
      }),
    );

    return app;
  },

  // =========================
  // 📄 FINAL CERTIFICATES
  // =========================
  async listCertificates({ page = 1, limit = 10, search = "" }) {
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    const skip = (parsedPage - 1) * parsedLimit;
    const query = buildSearchQuery(search);

    const [data, total] = await Promise.all([
      CertificateRecord.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),

      CertificateRecord.countDocuments(query),
    ]);

    return {
      data,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
    };
  },
};
