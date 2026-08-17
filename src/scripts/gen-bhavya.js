require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const DOWNLOAD_DIR = path.resolve(__dirname, '../../../downloads');

const inputData = {
  fullName: "Bhavya Jaswal",
  phoneNumber: "9102273331",
  email: "sudhir@gmail.com",
  dateOfBirth: "2026-07-17",
  course: "Cyber Security & Ethical Hacking",
  certificateType: "Academic Training",
  duration: "100 Hours",
  qualification: "Bachelor of Computer Applications (BCA)",
  organization: "IITM (Institute of Information Technology & Management, Janakpuri, New Delhi)",
  durationDates: "Jun 15, 2026 - Jul 31, 2026"
};

mongoose.connect('mongodb://localhost:27017/institute_management1').then(async () => {
  const { generateCertificatePdf } = require('../services/pdf.service');

  let fullCourse = inputData.course;
  if (inputData.organization) {
    fullCourse = `${inputData.course} (${inputData.organization})`;
  }

  let fullDuration = inputData.duration;
  if (inputData.durationDates) {
    fullDuration = `${inputData.duration} | Duration: ${inputData.durationDates}`;
  }

  console.log('🔄 Generating certificate for Bhavya Jaswal...');

  const pdfBuffer = await generateCertificatePdf({
    certificateNumber: 'SSSAM/CERT/BHAVYA-TEST',
    fullName: inputData.fullName,
    dateOfBirth: new Date(inputData.dateOfBirth),
    qualification: inputData.qualification,
    course: fullCourse,
    certificateType: inputData.certificateType,
    duration: fullDuration,
    issueDate: new Date(),
  });

  const filename = `Bhavya_Jaswal_IITM_Certificate.pdf`;
  await fs.writeFile(path.join(DOWNLOAD_DIR, filename), pdfBuffer);

  console.log(`✅ File saved: D:\\web\\downloads\\${filename}`);
  await mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
