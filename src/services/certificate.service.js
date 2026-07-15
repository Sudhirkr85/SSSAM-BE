const CertificateApplication = require("../models/CertificateApplication");
const CertificateRecord = require("../models/CertificateRecord");
const LegacyCertificate = require("../models/LegacyCertificate");

const { sendStudentEmail } = require("./emailService");


const { generateApplicationId } = require("../utils/appId");
const { generateCertificateNumber } = require("../utils/certNumber");
const createHttpError = require("http-errors");

// =============================
// ✅ HELPERS
// =============================

const normalizeText = (text) => text?.toString().trim();

const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// 🇮🇳 Indian Date
const formatIndianDate = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

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

// =============================
// ✅ APPLY
// =============================
const applyForCertificate = async (payload) => {
  const normalizedPhoneNumber = normalizeText(payload.phoneNumber);
  const normalizedEmail = normalizeText(payload.email).toLowerCase();
  
  const normalizedQualification = normalizeText(payload.qualification);

  let normalizedCourse = normalizeText(payload.course);
  if (payload.organization) {
    const normalizedOrg = normalizeText(payload.organization);
    if (normalizedOrg) {
      normalizedCourse = `${normalizedCourse} (${normalizedOrg})`;
    }
  }

  const normalizedCertificateType = normalizeText(payload.certificateType);

  let normalizedDuration = normalizeText(payload.duration);
  if (payload.durationDates) {
    const normalizedDates = normalizeText(payload.durationDates);
    if (normalizedDates) {
      normalizedDuration = `${normalizedDuration} | Duration: ${normalizedDates}`;
    }
  }

  const existingApplication = await CertificateApplication.findOne({
    phoneNumber: normalizedPhoneNumber,
    email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
    course: { $regex: `^${escapeRegex(normalizedCourse)}$`, $options: "i" }
  }).lean();

  if (existingApplication) {
    throw createHttpError(409, "Application already exists");
  }

  const applicationId = await generateApplicationId();

  const created = await CertificateApplication.create({
    ...payload,
    phoneNumber: normalizedPhoneNumber,
    email: normalizedEmail,
    qualification: normalizedQualification,
    course: normalizedCourse,
    certificateType: normalizedCertificateType,
    duration: normalizedDuration,
    applicationId,
  });

  // 📧 Student Email
  sendEmailAsync(() =>
    sendStudentEmail({
      name: created.fullName,
      email: created.email,
      phoneNumber: created.phoneNumber,
      course: created.course,
      certificateType: created.certificateType,
      applicationId: created.applicationId,
      duration: created.duration,
      status: "Pending",
      subject: "Application Submitted - SSSAM Academy",
      statusMessage: "Your application has been successfully submitted.",
      date: formatIndianDate(new Date()),
    }),
  );

  return created;
};

// =============================
// ✅ APPROVE
// =============================
const approveApplication = async (applicationId) => {
  const application = await CertificateApplication.findOne({ applicationId });

  if (!application) {
    throw createHttpError(404, "Application not found");
  }

  if (!application.certificateNumber) {
    application.certificateNumber = await generateCertificateNumber();
  }

  application.status = "Approved";
  application.issueDate = new Date();

  await application.save();

  await CertificateRecord.updateOne(
    { certificateNumber: application.certificateNumber },
    {
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
      qualification: application.qualification,
    },
    { upsert: true },
  );

  // 📧 Email
  sendEmailAsync(() =>
    sendStudentEmail({
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
    }),
  );

  return application;
};

// =============================
// ✅ VERIFY
// =============================
const verifyCertificate = async (certificateNumber) => {
  let record = await CertificateRecord.findOne({ certificateNumber });
  let isLegacy = false;

  if (!record) {
    record = await LegacyCertificate.findOne({ certificateNumber });
    isLegacy = true;
  }

  if (!record) {
    throw createHttpError(404, "Certificate not found");
  }

  const data = record.toObject();
  data.issueDate = formatIndianDate(data.issueDate);
  data.isLegacy = isLegacy;
  data.status = isLegacy ? (record.status || "Valid (Legacy Record)") : record.status;
  
  // Normalize field names so they look uniform to controller/client
  data.fullName = data.fullName || data.studentName;
  data.certificateType = data.certificateType || data.trainingType;

  return data;
};

// =============================
// ✅ STATUS
// =============================
const getApplicationStatus = async (applicationId) => {
  const application = await CertificateApplication.findOne({ applicationId });

  if (!application) {
    throw createHttpError(404, "Application not found");
  }

  const data = application.toObject();

  if (data.issueDate) {
    data.issueDate = formatIndianDate(data.issueDate);
  }

  return data;
};

// =============================
// ✅ REJECT
// =============================
const rejectApplication = async (applicationId, remarks) => {
  const application = await CertificateApplication.findOne({ applicationId });

  if (!application) {
    throw createHttpError(404, "Application not found");
  }

  application.status = "Rejected";
  application.remarks = remarks;

  await application.save();

  return application;
};

// =============================
// ✅ DOWNLOAD
// =============================
const getCertificateForDownload = async (certificateNumber, dateOfBirth) => {
  // Check primary first
  let record = await CertificateRecord.findOne({
    certificateNumber,
    dateOfBirth,
  });
  let isLegacy = false;

  if (!record) {
    // Fallback to legacy
    const legacyRecord = await LegacyCertificate.findOne({ certificateNumber });
    if (legacyRecord) {
      if (legacyRecord.dateOfBirth) {
        // Enforce DOB matching
        const reqDobStr = new Date(dateOfBirth).toISOString().split('T')[0];
        const certDobStr = new Date(legacyRecord.dateOfBirth).toISOString().split('T')[0];
        if (reqDobStr !== certDobStr) {
          throw createHttpError(404, "Invalid details (Date of birth mismatch)");
        }
      }
      record = legacyRecord;
      isLegacy = true;
    }
  }

  if (!record) {
    throw createHttpError(404, "Invalid details");
  }

  const data = record.toObject();
  data.isLegacy = isLegacy;
  data.fullName = data.fullName || data.studentName;
  data.certificateType = data.certificateType || data.trainingType;

  return data;
};


module.exports = {
  applyForCertificate,
  approveApplication,
  verifyCertificate,
  getApplicationStatus,
  rejectApplication,
  getCertificateForDownload,
};
