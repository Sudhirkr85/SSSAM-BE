require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const DOWNLOAD_DIR = path.resolve(__dirname, '../../../downloads');

const TEST_CASES = [
  // 1. Normal Training — 3 Months
  {
    label: '01_Normal_Training_WebDev_3Months',
    fullName: 'Rahul Kumar',
    dateOfBirth: '2001-05-15',
    qualification: null,
    course: 'Full Stack Web Development',
    certificateType: 'Training',
    duration: '3 Months',
    issueDate: '2026-07-10',
  },

  // 2. Normal Training — 100 Hours
  {
    label: '02_Normal_Training_DataAnalytics_100Hours',
    fullName: 'Priya Sharma',
    dateOfBirth: '2002-08-20',
    qualification: null,
    course: 'Data Analytics',
    certificateType: 'Training',
    duration: '100 Hours',
    issueDate: '2026-06-25',
  },

  // 3. Normal Training — 6 Months
  {
    label: '03_Normal_Training_CyberSecurity_6Months',
    fullName: 'Amit Singh',
    dateOfBirth: '2000-03-10',
    qualification: null,
    course: 'Ethical Hacking & Cyber Security',
    certificateType: 'Training',
    duration: '6 Months',
    issueDate: '2026-07-01',
  },

  // 4. College Training BCA — 6 Weeks with dates
  {
    label: '04_College_BCA_Python_6Weeks',
    fullName: 'Sneha Verma',
    dateOfBirth: '2002-11-25',
    qualification: 'BCA',
    course: 'Python Fullstack (Gurugram University)',
    certificateType: 'Training',
    duration: '6 Weeks | Duration: 01 June 2026 - 15 July 2026',
    issueDate: '2026-07-15',
  },

  // 5. College Training MCA — 6 Months with dates
  {
    label: '05_College_MCA_DataScience_6Months',
    fullName: 'Vikram Patel',
    dateOfBirth: '1999-07-18',
    qualification: 'MCA',
    course: 'Data Science & Machine Learning (Amity University Noida)',
    certificateType: 'Industrial Training',
    duration: '6 Months | Duration: 01 Jan 2026 - 30 June 2026',
    issueDate: '2026-07-01',
  },

  // 6. College Training B.Tech — 45 Days with dates
  {
    label: '06_College_BTech_MERN_45Days',
    fullName: 'Anjali Gupta',
    dateOfBirth: '2001-01-30',
    qualification: 'B.Tech CSE',
    course: 'MERN Stack Development (JIMS Engineering College)',
    certificateType: 'Industrial Training',
    duration: '45 Days | Duration: 15 May 2026 - 30 June 2026',
    issueDate: '2026-07-02',
  },

  // 7. Workshop — 2 Days
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

  // 8. Internship — 3 Months with dates
  {
    label: '08_Internship_WebDev_3Months',
    fullName: 'Pooja Yadav',
    dateOfBirth: '2003-06-14',
    qualification: null,
    course: 'Web Development',
    certificateType: 'Internship',
    duration: '3 Months | Duration: 01 April 2026 - 30 June 2026',
    issueDate: '2026-06-30',
  },

  // 9. Corporate Training — 40 Hours
  {
    label: '09_Corporate_ExcelPowerBI_40Hours',
    fullName: 'Deepak Thakur',
    dateOfBirth: '1990-09-22',
    qualification: null,
    course: 'Advanced Excel & Power BI',
    certificateType: 'Corporate Training',
    duration: '40 Hours',
    issueDate: '2026-07-20',
  },

  // 10. College Training Diploma — 6 Weeks with dates
  {
    label: '10_College_Diploma_AWS_6Weeks',
    fullName: 'Kavita Mishra',
    dateOfBirth: '2001-04-08',
    qualification: 'Diploma in Computer Science',
    course: 'AWS Cloud Computing (Haryana Polytechnic, Ambala)',
    certificateType: 'Industrial Training',
    duration: '6 Weeks | Duration: 02 June 2026 - 14 July 2026',
    issueDate: '2026-07-15',
  },
];

mongoose.connect('mongodb://localhost:27017/institute_management1').then(async () => {
  const { generateCertificatePdf } = require('../services/pdf.service');

  // ── Step 1: Delete all existing PDFs in downloads folder ─────────────────
  console.log('🗑️  Deleting old certificates...');
  const existing = await fs.readdir(DOWNLOAD_DIR).catch(() => []);
  for (const file of existing) {
    if (file.endsWith('.pdf')) {
      await fs.unlink(path.join(DOWNLOAD_DIR, file));
      console.log(`   Deleted: ${file}`);
    }
  }
  console.log(`   ✅ ${existing.filter(f => f.endsWith('.pdf')).length} files deleted\n`);

  // ── Step 2: Generate 10 new certificates ─────────────────────────────────
  for (const tc of TEST_CASES) {
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
      console.log(`   👤 ${tc.fullName} | 🎓 ${tc.qualification || '(none)'} | ⏱ ${tc.duration}`);
      console.log(`   📚 ${tc.course}\n`);

    } catch (err) {
      console.error(`   ❌ Failed: ${tc.label} →`, err.message, '\n');
    }
  }

  console.log('🎉 All 10 certificates generated in:', DOWNLOAD_DIR);
  await mongoose.disconnect();
}).catch(err => {
  console.error('DB Error:', err.message);
  process.exit(1);
});
