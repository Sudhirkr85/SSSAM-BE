const service = require("../services/admin.certificate.service");

const listApplications = async (req, res) => {
  try {
    const result = await service.listApplications(req.query);
    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch applications",
    });
  }
};

const getApplication = async (req, res) => {
  try {
    const data = await service.getApplication(req.params.applicationId);
    return res.status(200).json({
      success: true,
      message: "Application fetched successfully",
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch application",
    });
  }
};

const updateApplication = async (req, res) => {
  try {
    const data = await service.updateApplication(req.params.applicationId, req.body);
    return res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Failed to update application",
    });
  }
};

const approveApplication = async (req, res) => {
  try {
    const data = await service.approveApplication(req.params.applicationId);
    return res.status(200).json({
      success: true,
      message: "Application approved successfully",
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Failed to approve application",
    });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const data = await service.rejectApplication(req.params.applicationId, reason);
    return res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Failed to reject application",
    });
  }
};

const listCertificates = async (req, res) => {
  try {
    const result = await service.listCertificates(req.query);
    return res.status(200).json({
      success: true,
      message: "Certificates fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch certificates",
    });
  }
};

const updateCertificate = async (req, res) => {
  try {
    const data = await service.updateCertificate(
      req.params.certificateNumber,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Certificate updated successfully",
      data,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || "Failed to update certificate",
    });
  }
};

module.exports = {
  listApplications,
  getApplication,
  updateApplication,
  approveApplication,
  rejectApplication,
  listCertificates,
  updateCertificate,
};