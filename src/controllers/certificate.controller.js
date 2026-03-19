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

const applyCertificate = async (req, res, next) => {
  try {
    const application = await applyForCertificate(req.body);

    return sendSuccess(res, 201, {
      message: 'Application Submitted Successfully',
      applicationId: application.applicationId
    });
  } catch (error) {
    return next(error);
  }
};

const verifyCertificateByNumber = async (req, res, next) => {
  try {
    const { certificateNumber } = req.query;
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
    return next(error);
  }
};

const downloadCertificate = async (req, res, next) => {
  try {
    const { certificateNumber, dateOfBirth } = req.body;
    const record = await getCertificateForDownload(certificateNumber, dateOfBirth);
    const pdfBuffer = await generateCertificatePdf(record);

    const filename = `certificate-${record.certificateNumber}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
};

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
    return next(error);
  }
};

const approveApplicationByAdmin = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await approveApplication(applicationId);

    return sendSuccess(res, 200, {
      message: 'Application approved successfully.',
      applicationId: application.applicationId,
      status: application.status,
      certificateNumber: application.certificateNumber,
      issueDate: application.issueDate
    });
  } catch (error) {
    return next(error);
  }
};

const rejectApplicationByAdmin = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { remarks } = req.body;
    const application = await rejectApplication(applicationId, remarks);

    return sendSuccess(res, 200, {
      message: 'Application rejected successfully.',
      applicationId: application.applicationId,
      status: application.status,
      remarks: application.remarks
    });
  } catch (error) {
    return next(error);
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
