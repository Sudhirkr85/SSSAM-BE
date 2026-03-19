const CertificateApplication = require('../models/CertificateApplication');
const CertificateRecord = require('../models/CertificateRecord');
const { generateApplicationId } = require('../utils/appId');
const { generateCertificateNumber } = require('../utils/certNumber');

const isSameDate = (d1, d2) => {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
};

const createHttpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getCertificateRecordWithRecovery = async (certificateNumber) => {
  const normalizedNumber = String(certificateNumber || '').trim();
  if (!normalizedNumber) {
    return null;
  }

  let record = await CertificateRecord.findOne({ certificateNumber: normalizedNumber }).lean();
  if (record) {
    return record;
  }

  const application = await CertificateApplication.findOne({
    certificateNumber: normalizedNumber,
    status: 'Approved'
  });

  if (!application) {
    return null;
  }

  const issueDate = application.issueDate || new Date();

  await CertificateRecord.updateOne(
    { certificateNumber: normalizedNumber },
    {
      certificateNumber: normalizedNumber,
      fullName: application.fullName,
      dateOfBirth: application.dateOfBirth,
      course: application.course,
      certificateType: application.certificateType,
      duration: application.duration,
      issueDate,
      instituteName: 'SSSAM Academy',
      status: 'Verified',
      applicationId: application._id
    },
    { upsert: true }
  );

  record = await CertificateRecord.findOne({ certificateNumber: normalizedNumber }).lean();
  return record;
};

const applyForCertificate = async (payload) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const applicationId = await generateApplicationId();
      const created = await CertificateApplication.create({
        ...payload,
        applicationId
      });
      return created;
    } catch (error) {
      if (error?.code === 11000 && attempt < 4) {
        continue;
      }
      throw error;
    }
  }

  throw createHttpError(500, 'Failed to create application. Please try again.');
};

const verifyCertificate = async (certificateNumber) => {
  const record = await getCertificateRecordWithRecovery(certificateNumber);
  if (!record) {
    throw createHttpError(404, 'Certificate not found.');
  }
  return record;
};

const getApplicationStatus = async (applicationId) => {
  const application = await CertificateApplication.findOne({ applicationId }).lean();

  if (!application) {
    throw createHttpError(404, 'Application not found.');
  }

  return application;
};

const approveApplication = async (applicationId) => {
  const application = await CertificateApplication.findOne({ applicationId });

  if (!application) {
    throw createHttpError(404, 'Application not found.');
  }

  // Idempotent behavior for already-approved applications.
  if (application.status === 'Approved' && application.certificateNumber) {
    const existing = await CertificateRecord.findOne({
      certificateNumber: application.certificateNumber
    });

    if (existing) {
      return application;
    }
  }

  let certificateNumber = application.certificateNumber;

  if (!certificateNumber) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        certificateNumber = await generateCertificateNumber();
        if (certificateNumber) break;
      } catch (error) {
        if (attempt === 4) throw error;
      }
    }
  }

  const issueDate = new Date();

  application.status = 'Approved';
  application.certificateNumber = certificateNumber;
  application.issueDate = issueDate;
  if (application.remarks) {
    application.remarks = null;
  }
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
      issueDate,
      instituteName: 'SSSAM Academy',
      status: 'Verified',
      applicationId: application._id
    },
    { upsert: true }
  );

  return application;
};

const rejectApplication = async (applicationId, remarks = null) => {
  const application = await CertificateApplication.findOne({ applicationId });

  if (!application) {
    throw createHttpError(404, 'Application not found.');
  }

  const oldCertificateNumber = application.certificateNumber;

  application.status = 'Rejected';
  application.remarks = remarks || null;
  application.certificateNumber = null;
  application.issueDate = null;
  await application.save();

  if (oldCertificateNumber) {
    await CertificateRecord.deleteOne({ certificateNumber: oldCertificateNumber });
  }

  return application;
};

const getCertificateForDownload = async (certificateNumber, dateOfBirth) => {
  const record = await getCertificateRecordWithRecovery(certificateNumber);

  if (!record) {
    throw createHttpError(404, 'Certificate not found.');
  }

  if (!isSameDate(record.dateOfBirth, dateOfBirth)) {
    throw createHttpError(400, 'Invalid dateOfBirth for this certificate.');
  }

  return record;
};

module.exports = {
  applyForCertificate,
  verifyCertificate,
  getApplicationStatus,
  approveApplication,
  rejectApplication,
  getCertificateForDownload
};
