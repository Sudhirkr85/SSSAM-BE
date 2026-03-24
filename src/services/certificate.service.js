const CertificateApplication = require("../models/CertificateApplication");
const CertificateRecord = require("../models/CertificateRecord");
const { sendEmail } = require("./email.service");
const { generateApplicationId } = require("../utils/appId");
const { generateCertificateNumber } = require("../utils/certNumber");
const { getStudentEmailTemplate } = require("./emailTemplates");
const createHttpError = require("http-errors");

// ✅ Helpers
const normalizeText = (text) => text?.toString().trim();

const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  // ✅ NON-BLOCKING EMAIL
  setImmediate(() => {
    sendEmail({
      to: created.email,
      subject: "Application Submitted - SSSAM Academy",
      html: getStudentEmailTemplate({
        name: created.fullName,
        course: created.course,
        certificateType: created.certificateType,
        applicationId: created.applicationId,
        duration: created.duration,
        status: "Pending",
        statusMessage: "Your application has been successfully submitted.",
        date: new Date().toLocaleString(),
      }),
    }).catch((err) => console.error("Email error:", err));
  });

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
    { upsert: true }
  );

  // ✅ NON-BLOCKING EMAIL
  setImmediate(() => {
    sendEmail({
      to: application.email,
      subject: "Application Approved - SSSAM Academy",
      html: getStudentEmailTemplate({
        name: application.fullName,
        course: application.course,
        certificateType: application.certificateType,
        applicationId: application.applicationId,
        certificateNumber: application.certificateNumber,
        duration: application.duration,
        status: "Approved",
        statusMessage: "Your certificate has been generated.",
        date: new Date().toLocaleString(),
      }),
    }).catch((err) => console.error("Email error:", err));
  });

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

  return record;
};

// =============================
// ✅ STATUS
// =============================
const getApplicationStatus = async (applicationId) => {
  const application = await CertificateApplication.findOne({ applicationId });

  if (!application) {
    throw createHttpError(404, "Application not found");
  }

  return application;
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
  getCertificateForDownload
};