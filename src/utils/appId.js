const CertificateApplication = require('../models/CertificateApplication');

const APP_ID_PREFIX = 'SSSAM-APP-';

const generateApplicationId = async () => {
  let isUnique = false;
  let finalId = '';

  while (!isUnique) {
    // Generate a random 6-digit number between 100000 and 999999
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    finalId = `${APP_ID_PREFIX}${randomNum}`;

    // Verify it doesn't already exist in the database
    const existing = await CertificateApplication.findOne({ applicationId: finalId }).lean();
    if (!existing) {
      isUnique = true;
    }
  }

  return finalId;
};

module.exports = {
  generateApplicationId
};
