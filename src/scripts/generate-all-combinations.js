require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const DOWNLOAD_DIR = path.resolve(__dirname, '../../../downloads');

const COMBINATIONS = [
  // 1. Normal Training - Month based
  {
    label: '01_Normal_Training_3Months',
    fullName: 'Rahul Kumar',
    dateOfBirth: '2001-05-15',
    qualification: null,
    course: 'Full Stack Web Development',
    certificateType: 'Training',
    duration: '3 Months',
    issueDate: '2026-07-10',
  },
  // 2. Normal Training - Hour based
  {
    label: '02_Normal_Training_100Hours',
    fullName: 'Priya Sharma',
    dateOfBirth: '2002-08-20',
    qualification: null,
    course: 'Data Analytics',
    certificateType: 'Training',
    duration: '100 Hours',
    issueDate: '2026-06-25',
  },
  // 3. College Training - BCA + IITM + 6 Weeks + Date Range
  {
    label: '03_College_BCA_IITM_6Weeks_Dates',
    fullName: 'Sneha Verma',
    dateOfBirth: '2002-11-25',
    qualification: 'BCA',
    course: 'Cyber Security & Ethical Hacking (IITM Janakpuri)',
    certificateType: 'Industrial Training',
    duration: '6 Weeks | Duration: 01 June 2026 - 15 July 2026',
    issueDate: '2026-07-15',
  },
  // 4. College Training - MCA + IITM + 60 Hours (Hours based college training)
  {
    label: '04_College_MCA_IITM_60Hours',
    fullName: 'Rohan Joshi',
    dateOfBirth: '2000-02-14',
    qualification: 'MCA',
    course: 'Python Programming (IITM Janakpuri)',
    certificateType: 'Training',
    duration: '60 Hours',
    issueDate: '2026-07-10',
  },
  // 5. College Training - B.Tech + Amity + 6 Months + Date Range
  {
    label: '05_College_BTech_Amity_6Months_Dates',
    fullName: 'Vikram Patel',
    dateOfBirth: '1999-07-18',
    qualification: 'B.Tech CSE',
    course: 'Data Science & Machine Learning (Amity University Noida)',
    certificateType: 'Industrial Training',
    duration: '6 Months | Duration: 01 Jan 2026 - 30 June 2026',
    issueDate: '2026-07-01',
  },
  // 6. College Training - Diploma + Govt Poly + 120 Hours (Hours based)
  {
    label: '06_College_Diploma_Polytechnic_120Hours',
    fullName: 'Deepak Thakur',
    dateOfBirth: '2001-09-22',
    qualification: 'Diploma in Computer Science',
    course: 'AWS Cloud Computing (Haryana Polytechnic, Ambala)',
    certificateType: 'Industrial Training',
    duration: '120 Hours',
    issueDate: '2026-07-15',
  },
  // 7. Workshop - 2 Days
  {
    label: '07_Workshop_AI_2Days',
    fullName: 'Rajesh Mehra',
    dateOfBirth: '1998-12-05',
    qualification: null,
    course: 'Artificial Intelligence & Machine Learning',
    certificateType: 'Workshop',
    duration: '2 Days',
    issueDate: '2026-05-20',
  },
  // 8. Workshop - 16 Hours (Hour based Workshop)
  {
    label: '08_Workshop_CyberSec_16Hours',
    fullName: 'Aakash Tyagi',
    dateOfBirth: '2002-04-12',
    qualification: null,
    course: 'Ethical Hacking Workshop',
    certificateType: 'Workshop',
    duration: '16 Hours',
    issueDate: '2026-05-22',
  },
  // 9. Internship - 3 Months with Date Range
  {
    label: '09_Internship_MERN_3Months_Dates',
    fullName: 'Pooja Yadav',
    dateOfBirth: '2003-06-14',
    qualification: null,
    course: 'MERN Stack Development',
    certificateType: 'Internship',
    duration: '3 Months | Duration: 01 April 2026 - 30 June 2026',
    issueDate: '2026-06-30',
  },
  // 10. Corporate Training - 40 Hours
  {
    label: '10_Corporate_PowerBI_40Hours',
    fullName: 'Kavita Mishra',
    dateOfBirth: '1990-09-10',
    qualification: null,
    course: 'Advanced Excel & Power BI',
    certificateType: 'Corporate Training',
    duration: '40 Hours',
    issueDate: '2026-07-20',
  },
];

mongoose.connect('mongodb://localhost:27017/institute_management1').then(async () => {
  const { generateCertificatePdf } = require('../services/pdf.service');

  // Clean old files
  console.log('🗑️  Cleaning old certificates...');
  const existing = await fs.readdir(DOWNLOAD_DIR).catch(() => []);
  for (const file of existing) {
    if (file.endsWith('.pdf')) {
      await fs.unlink(path.join(DOWNLOAD_DIR, file));
    }
  }

  // Generate new combination certificates
  for (const tc of COMBINATIONS) {
    try {
      console.log(`🔄 Generating: ${tc.label}`);

      const pdfBuffer = await generateCertificatePdf({
        certificateNumber: `SSSAM/CERT/TEST-${tc.label.split('_')[0]}`,
        fullName: tc.fullName,
        dateOfBirth: new Date(tc.dateOfBirth),
        qualification: tc.qualification || null,
        course: tc.course,
        certificateType: tc.certificateType,
        duration: tc.duration,
        issueDate: new Date(tc.issueDate),
      });

      const filename = `${tc.label}.pdf`;
      await fs.writeFile(path.join(DOWNLOAD_DIR, filename), pdfBuffer);

      console.log(`   ✅ ${filename}`);
      console.log(`   👤 ${tc.fullName} | 🎓 Qualification: ${tc.qualification || '(none)'}`);
      console.log(`   ⏱ Duration: ${tc.duration}`);
      console.log(`   📚 Course: ${tc.course}\n`);

    } catch (err) {
      console.error(`   ❌ Failed: ${tc.label} →`, err.message, '\n');
    }
  }

  console.log('🎉 All combination certificates generated in:', DOWNLOAD_DIR);
  await mongoose.disconnect();
}).catch(err => {
  console.error('DB Error:', err.message);
  process.exit(1);
});
