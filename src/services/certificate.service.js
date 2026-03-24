const CertificateApplication = require("../models/CertificateApplication");
const CertificateRecord = require("../models/CertificateRecord");
const { sendEmail } = require("./email.service");
const { generateApplicationId } = require("../utils/appId");
const { generateCertificateNumber } = require("../utils/certNumber");
const { getStudentEmailTemplate } = require("./emailTemplates");

const applyForCertificate = async (payload) => {
  // Duplicate prevention: block if phoneNumber+email+course+certificateType match (duration ignored)
  const normalizedPhoneNumber = normalizeText(payload.phoneNumber);
  const normalizedEmail = normalizeText(payload.email).toLowerCase();
  const normalizedCourse = normalizeText(payload.course);
  const normalizedCertificateType = normalizeText(payload.certificateType);

  const existingApplication = await CertificateApplication.findOne({
    phoneNumber: normalizedPhoneNumber,
    email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' },
    course: { $regex: `^${escapeRegex(normalizedCourse)}$`, $options: 'i' },
    certificateType: normalizedCertificateType
  }).lean();

  if (existingApplication) {
    throw createHttpError(409, 'Application already exists for this mobile, email, course and certificate type.');
  }

  const normalizedPayload = {
    ...payload,
    phoneNumber: normalizedPhoneNumber,
    email: normalizedEmail,
    course: normalizedCourse,
    certificateType: normalizedCertificateType
  };
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const applicationId = await generateApplicationId();

      const created = await CertificateApplication.create({
        ...payload,
        applicationId,
      });

      // ✅ NON-BLOCKING EMAIL (TEMPLATE)
      setImmediate(() => {
        sendEmail({
          to: created.email,
          subject: "Application Submitted - SSSAM Academy",
          html: getStudentEmailTemplate({
            name: created.fullName,
            email: created.email,
            course: created.course,
            certificateType: created.certificateType,
            applicationId: created.applicationId,
            certificateNumber: "",
            duration: created.duration,
            status: "Pending",
            statusMessage: "Your application has been successfully submitted.",
            date: new Date().toLocaleString(),
          }),
        }).catch((err) => console.error("Email error (apply):", err));
      });

      return created;
    } catch (error) {
      if (error?.code === 11000 && attempt < 4) continue;
      throw error;
    }
  }
};

const approveApplication = async (applicationId) => {
  const application = await CertificateApplication.findOne({ applicationId });
  if (!application) throw new Error("Application not found");

  let certificateNumber = application.certificateNumber;

  if (!certificateNumber) {
    certificateNumber = await generateCertificateNumber();
  }

  application.status = "Approved";
  application.certificateNumber = certificateNumber;
  application.issueDate = new Date();

  await application.save();

  await CertificateRecord.updateOne(
    { certificateNumber },
    {
      certificateNumber,
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

  // ✅ NON-BLOCKING EMAIL (TEMPLATE)
  setImmediate(() => {
    sendEmail({
      to: application.email,
      subject: "Application Approved - SSSAM Academy",
      html: getStudentEmailTemplate({
        name: application.fullName,
        email: application.email,
        course: application.course,
        certificateType: application.certificateType,
        applicationId: application.applicationId,
        certificateNumber: application.certificateNumber,
        duration: application.duration,
        status: "Approved",
        statusMessage:
          "Your application has been approved. Your certificate has been generated.",
        date: new Date().toLocaleString(),
      }),
    }).catch((err) => console.error("Email error (approve):", err));
  });

  return application;
};

module.exports = {
  applyForCertificate,
  approveApplication,
};
