require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const DOWNLOAD_DIR = path.resolve(__dirname, '../../../downloads');

mongoose.connect('mongodb://localhost:27017/institute_management1').then(async () => {
  const { generateCertificatePdf } = require('../services/pdf.service');

  const pdfBuffer = await generateCertificatePdf({
    certificateNumber: 'SSSAM/CERT/301658',
    fullName: 'Rahul Kumar',
    dateOfBirth: new Date('2001-05-15'),
    qualification: null,
    course: 'Web Development',
    certificateType: 'Training',
    duration: '3 Months',
    issueDate: new Date(),
  });

  const filename = '01_-_Normal_Training__Web_Development_NEW.pdf';
  await fs.writeFile(path.join(DOWNLOAD_DIR, filename), pdfBuffer);
  console.log('✅ Done! File:', path.join(DOWNLOAD_DIR, filename));

  await mongoose.disconnect();
});
