const service = require("../services/admin.certificate.service");

const listApplications = async (req, res) => {
  try {
    const result = await service.listApplications(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getApplication = async (req, res) => {
  try {
    const data = await service.getApplication(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateApplication = async (req, res) => {
  try {
    const data = await service.updateApplication(req.params.id, req.body);
    res.json({ message: "Updated", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const approveApplication = async (req, res) => {
  try {
    const data = await service.approveApplication(req.params.id);
    res.json({ message: "Approved", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { reason } = req.body;
    const data = await service.rejectApplication(req.params.id, reason);
    res.json({ message: "Rejected", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const listCertificates = async (req, res) => {
  try {
    const result = await service.listCertificates(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  listApplications,
  getApplication,
  updateApplication,
  approveApplication,
  rejectApplication,
  listCertificates
};