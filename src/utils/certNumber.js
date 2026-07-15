const CertificateRecord = require("../models/CertificateRecord");
const LegacyCertificate = require("../models/LegacyCertificate");

const generateCertificateNumber = async () => {
  let attempts = 0;
  while (attempts < 10) {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 100000 to 999999
    const certNum = `SSSAM/CERT/${randomNum}`;

    // Check primary record
    const existsPrimary = await CertificateRecord.findOne({ certificateNumber: certNum });
    if (!existsPrimary) {
      // Check legacy record
      const existsLegacy = await LegacyCertificate.findOne({ certificateNumber: certNum });
      if (!existsLegacy) {
        return certNum;
      }
    }
    attempts++;
  }
  throw new Error("Failed to generate a unique certificate number after 10 attempts due to collisions.");
};

module.exports = {
  generateCertificateNumber,
};
