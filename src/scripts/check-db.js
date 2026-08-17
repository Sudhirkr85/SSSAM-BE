require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/institute_management1').then(async () => {
  const CA = require('../models/CertificateApplication');
  const CR = require('../models/CertificateRecord');

  const apps = await CA.find({ email: /test\.com/ })
    .select('fullName course qualification certificateType status applicationId')
    .lean();

  const recs = await CR.find({ course: /Web Development|Data Analytics|Python Fullstack|Ethical Hacking|Machine Learning|MERN Stack|Excel|Java|AWS|Digital Marketing/ })
    .select('fullName certificateNumber qualification course certificateType')
    .lean();

  console.log('\n=== CertificateApplication (10 records) ===');
  apps.forEach((a, i) => {
    console.log(`${i+1}. ${a.fullName} | ${a.course} | Qualification: ${a.qualification || '(none)'} | Status: ${a.status}`);
  });

  console.log('\n=== CertificateRecord (10 records) ===');
  recs.forEach((r, i) => {
    console.log(`${i+1}. ${r.fullName} | ${r.certificateNumber} | Qualification: ${r.qualification || '(none)'} | ${r.course}`);
  });

  console.log(`\nTotal Applications: ${apps.length}`);
  console.log(`Total Records: ${recs.length}`);

  await mongoose.disconnect();
});
