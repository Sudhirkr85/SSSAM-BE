const CertificateRecord = require('../models/CertificateRecord');

const CERT_PREFIX = 'CERT';
const CERT_PAD = 6;

const generateCertificateNumber = async () => {
  const latest = await CertificateRecord.findOne({
    certificateNumber: { $regex: `^${CERT_PREFIX}\\d+$` }
  })
    .sort({ certificateNumber: -1 })
    .select('certificateNumber')
    .lean();

  const current = latest?.certificateNumber
    ? Number(latest.certificateNumber.replace(CERT_PREFIX, ''))
    : 0;

  const next = current + 1;
  return `${CERT_PREFIX}${String(next).padStart(CERT_PAD, '0')}`;
};

module.exports = {
  generateCertificateNumber
};
