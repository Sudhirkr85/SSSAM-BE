const {
  applyForCertificate,
  verifyCertificate,
  getApplicationStatus,
  approveApplication,
  rejectApplication,
  getCertificateForDownload
} = require('../services/certificate.service');

const { generateCertificatePdf } = require('../services/pdf.service');
const { sendSuccess } = require('../utils/response');

// ✅ Apply Certificate
const applyCertificate = async (req, res, next) => {
  try {
    const application = await applyForCertificate(req.body);

    return sendSuccess(res, 201, {
      message: 'Application Submitted Successfully',
      applicationId: application.applicationId
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Verify Certificate
const verifyCertificateByNumber = async (req, res, next) => {
  try {
    const { certificateNumber } = req.query;

    if (!certificateNumber) {
      return res.status(400).json({ message: "Certificate number is required" });
    }

    const record = await verifyCertificate(certificateNumber);

    return sendSuccess(res, 200, {
      studentName: record.fullName,
      course: record.course,
      duration: record.duration,
      certificateNumber: record.certificateNumber,
      issueDate: record.issueDate,
      instituteName: record.instituteName,
      status: record.status
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Download Certificate
const downloadCertificate = async (req, res, next) => {
  try {
    const { certificateNumber, dateOfBirth } = req.body;

    if (!certificateNumber || !dateOfBirth) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const record = await getCertificateForDownload(certificateNumber, dateOfBirth);
    const pdfBuffer = await generateCertificatePdf(record);

    const filename = `certificate-${record.certificateNumber}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// ✅ Get Status
const getStatusByApplicationId = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await getApplicationStatus(applicationId);

    const payload = {
      name: application.fullName,
      course: application.course,
      certificateType: application.certificateType,
      status: application.status
    };

    if (application.status === 'Approved') {
      payload.certificateNumber = application.certificateNumber;
      payload.issueDate = application.issueDate;
    }

    return sendSuccess(res, 200, payload);
  } catch (error) {
    next(error);
  }
};

// ✅ Approve
const approveApplicationByAdmin = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await approveApplication(applicationId);

    return sendSuccess(res, 200, {
      message: 'Application approved successfully',
      applicationId: application.applicationId,
      status: application.status,
      certificateNumber: application.certificateNumber,
      issueDate: application.issueDate
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Reject
const rejectApplicationByAdmin = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { remarks } = req.body;

    const application = await rejectApplication(applicationId, remarks);

    return sendSuccess(res, 200, {
      message: 'Application rejected successfully',
      applicationId: application.applicationId,
      status: application.status,
      remarks: application.remarks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyCertificate,
  verifyCertificateByNumber,
  downloadCertificate,
  getStatusByApplicationId,
  approveApplicationByAdmin,
  rejectApplicationByAdmin
};