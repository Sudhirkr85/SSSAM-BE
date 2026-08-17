require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const DOWNLOAD_DIR = path.resolve(__dirname, '../../../downloads');

const OPTIONS = [
  {
    label: 'Option_A',
    wishText: "at SSSAM Academy, having successfully completed all training modules and demonstrated strong practical proficiency in the subject. The candidate actively participated in hands-on sessions, live projects, and practical assessments. We wish them continued success in their professional journey."
  },
  {
    label: 'Option_B',
    wishText: "at SSSAM Academy, having successfully completed all training modules and demonstrated strong practical proficiency in the subject. Throughout the program, the candidate exhibited consistent dedication, technical aptitude, and a professional attitude. SSSAM Academy commends their efforts and hereby certifies their competence in the domain. We wish them continued success in their professional journey."
  },
  {
    label: 'Option_C',
    wishText: "at SSSAM Academy, having successfully completed all training modules, practical assignments, and internal assessments with dedication and commitment. The candidate demonstrated strong technical proficiency and a professional approach throughout the duration of the program. SSSAM Academy is proud to recognize this achievement and recommends the candidate for professional opportunities in the relevant field. We wish them continued growth and success in their career."
  }
];

mongoose.connect('mongodb://localhost:27017/institute_management1').then(async () => {
  const pdfServicePath = require.resolve('../services/pdf.service');

  for (const opt of OPTIONS) {
    // Patch wishText dynamically via temp override
    delete require.cache[pdfServicePath];

    // Read the pdf service and patch wishText for regular training
    const pdfService = require('../services/pdf.service');

    // We'll pass wishText override via a wrapper
    const { generateCertificatePdf } = pdfService;

    // Generate with monkey-patch approach — create temp record with custom field
    const pdfBuffer = await generateCertificatePdf({
      certificateNumber: 'SSSAM/CERT/301658',
      fullName: 'Rahul Kumar',
      dateOfBirth: new Date('2001-05-15'),
      qualification: null,
      course: 'Web Development',
      certificateType: 'Training',
      duration: '3 Months',
      issueDate: new Date(),
      _wishTextOverride: opt.wishText,  // pass override
    });

    const filename = `Normal_Training_${opt.label}.pdf`;
    await fs.writeFile(path.join(DOWNLOAD_DIR, filename), pdfBuffer);
    console.log(`✅ ${filename}`);
  }

  console.log('\n🎉 All 3 options generated in:', DOWNLOAD_DIR);
  await mongoose.disconnect();
});
