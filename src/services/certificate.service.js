const CertificateApplication = require("../models/CertificateApplication");
const CertificateRecord = require("../models/CertificateRecord");

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
  const normalizedCourse = normalizeText(payload.course);
  const normalizedCertificateType = normalizeText(payload.certificateType);

  const existingApplication = await CertificateApplication.findOne({
    phoneNumber: normalizedPhoneNumber,
    email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
    course: { $regex: `^${escapeRegex(normalizedCourse)}$`, $options: "i" },
    certificateType: normalizedCertificateType,
  }).lean();

  if (existingApplication) {
    throw createHttpError(409, "Application already exists");
  }

  const applicationId = await generateApplicationId();

  const created = await CertificateApplication.create({
    ...payload,
    phoneNumber: normalizedPhoneNumber,
    email: normalizedEmail,
    course: normalizedCourse,
    certificateType: normalizedCertificateType,
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
  const record = await CertificateRecord.findOne({ certificateNumber });

  if (!record) {
    throw createHttpError(404, "Certificate not found");
  }

  const data = record.toObject();
  data.issueDate = formatIndianDate(data.issueDate);

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
  const record = await CertificateRecord.findOne({
    certificateNumber,
    dateOfBirth,
  });

  if (!record) {
    throw createHttpError(404, "Invalid details");
  }

  return record;
};

module.exports = {
  applyForCertificate,
  approveApplication,
  verifyCertificate,
  getApplicationStatus,
  rejectApplication,
  getCertificateForDownload,
};
