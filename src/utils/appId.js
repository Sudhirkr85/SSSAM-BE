const CertificateApplication = require('../models/CertificateApplication');

const APP_ID_PREFIX = 'APP';
const APP_ID_PAD = 6;

const generateApplicationId = async () => {
  const latest = await CertificateApplication.findOne({
    applicationId: { $regex: `^${APP_ID_PREFIX}\\d+$` }
  })
    .sort({ applicationId: -1 })
    .select('applicationId')
    .lean();

  const current = latest?.applicationId
    ? Number(latest.applicationId.replace(APP_ID_PREFIX, ''))
    : 0;

  const next = current + 1;
  return `${APP_ID_PREFIX}${String(next).padStart(APP_ID_PAD, '0')}`;
};

module.exports = {
  generateApplicationId
};
