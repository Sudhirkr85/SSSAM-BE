const mongoose = require('mongoose');
const Course = require('../models/Course');
const Organization = require('../models/Organization');

const defaultCourses = [
  // Programming & Development
  { name: 'Python Programming', category: 'Programming & Development' },
  { name: 'Java Programming', category: 'Programming & Development' },
  { name: 'C/C++ Programming', category: 'Programming & Development' },
  { name: 'JavaScript Programming', category: 'Programming & Development' },
  { name: 'PHP Development', category: 'Programming & Development' },
  { name: 'Node.js Backend Development', category: 'Programming & Development' },
  { name: 'React.js Frontend Development', category: 'Programming & Development' },
  { name: 'Angular Frontend Development', category: 'Programming & Development' },
  { name: 'Vue.js Frontend Development', category: 'Programming & Development' },
  { name: 'MERN Stack Web Development', category: 'Programming & Development' },
  { name: 'Python Fullstack Development', category: 'Programming & Development' },
  { name: 'Java Fullstack Development', category: 'Programming & Development' },
  { name: 'Django Web Framework', category: 'Programming & Development' },
  { name: '.NET Web Development', category: 'Programming & Development' },
  { name: 'Go (Golang) Programming', category: 'Programming & Development' },
  { name: 'Responsive Web Development', category: 'Programming & Development' },
  { name: 'WordPress Development', category: 'Programming & Development' },
  { name: 'Flutter App Development', category: 'Programming & Development' },
  { name: 'Android Application Development', category: 'Programming & Development' },
  { name: 'iOS Application Development', category: 'Programming & Development' },

  // Data & AI
  { name: 'Data Science', category: 'Data & AI' },
  { name: 'Machine Learning', category: 'Data & AI' },
  { name: 'Deep Learning', category: 'Data & AI' },
  { name: 'Artificial Intelligence', category: 'Data & AI' },
  { name: 'Data Analytics', category: 'Data & AI' },
  { name: 'Data Engineering', category: 'Data & AI' },
  { name: 'Power BI Business Intelligence', category: 'Data & AI' },
  { name: 'Tableau Data Visualization', category: 'Data & AI' },
  { name: 'SQL & Database Administration', category: 'Data & AI' },
  { name: 'Business Analytics', category: 'Data & AI' },
  { name: 'Big Data & Hadoop Ecosystem', category: 'Data & AI' },
  { name: 'Natural Language Processing (NLP)', category: 'Data & AI' },

  // Cyber Security & Cloud
  { name: 'Ethical Hacking', category: 'Cyber Security & Cloud' },
  { name: 'Cyber Security Fundamentals', category: 'Cyber Security & Cloud' },
  { name: 'Certified Ethical Hacker (CEH)', category: 'Cyber Security & Cloud' },
  { name: 'AWS Cloud Architecture', category: 'Cyber Security & Cloud' },
  { name: 'Microsoft Azure Services', category: 'Cyber Security & Cloud' },
  { name: 'Google Cloud Platform (GCP)', category: 'Cyber Security & Cloud' },
  { name: 'CCNA Network Associate', category: 'Cyber Security & Cloud' },
  { name: 'CCNP Network Professional', category: 'Cyber Security & Cloud' },
  { name: 'Linux System Administration', category: 'Cyber Security & Cloud' },
  { name: 'Cloud Computing Infrastructure', category: 'Cyber Security & Cloud' },
  { name: 'CompTIA Security+', category: 'Cyber Security & Cloud' },
  { name: 'Penetration Testing & Auditing', category: 'Cyber Security & Cloud' },

  // Digital Marketing
  { name: 'Digital Marketing Specialist', category: 'Digital Marketing' },
  { name: 'SEO & SEM Optimization', category: 'Digital Marketing' },
  { name: 'Social Media Marketing', category: 'Digital Marketing' },
  { name: 'Content Marketing & Strategy', category: 'Digital Marketing' },
  { name: 'Email Marketing & Automation', category: 'Digital Marketing' },
  { name: 'Affiliate Marketing', category: 'Digital Marketing' },
  { name: 'Google Ads Certification', category: 'Digital Marketing' },
  { name: 'Facebook Ads & Meta Suite', category: 'Digital Marketing' },
  { name: 'YouTube Marketing & SEO', category: 'Digital Marketing' },

  // Office & Business Skills
  { name: 'Advanced Excel & Macros', category: 'Office & Business Skills' },
  { name: 'MS Office Suite Productivity', category: 'Office & Business Skills' },
  { name: 'Tally Prime Financial Accounting', category: 'Office & Business Skills' },
  { name: 'Tally ERP 9 Systems', category: 'Office & Business Skills' },
  { name: 'Modern Accounting Principles', category: 'Office & Business Skills' },
  { name: 'HR Management & Payroll', category: 'Office & Business Skills' },
  { name: 'Business Communication Skills', category: 'Office & Business Skills' },
  { name: 'Basic Computer Operations', category: 'Office & Business Skills' },
  { name: 'Spoken English & Communication', category: 'Office & Business Skills' },
  { name: 'Personality Development', category: 'Office & Business Skills' },

  // Design & Creative
  { name: 'Graphic Design', category: 'Design & Creative' },
  { name: 'UI/UX Design Concepts', category: 'Design & Creative' },
  { name: 'Adobe Photoshop Professional', category: 'Design & Creative' },
  { name: 'Adobe Illustrator Professional', category: 'Design & Creative' },
  { name: 'AutoCAD Drafting & Modeling', category: 'Design & Creative' },
  { name: '3D Animation & Modeling', category: 'Design & Creative' },
  { name: 'Video Editing Masterclass', category: 'Design & Creative' },
  { name: 'Motion Graphics Design', category: 'Design & Creative' },
  { name: 'Figma Prototyping', category: 'Design & Creative' },
  { name: 'CorelDraw Design & Layout', category: 'Design & Creative' }
];

const defaultOrganizations = [
  { name: 'Gurugram University' },
  { name: 'Delhi University' },
  { name: 'Amity University Gurugram' },
  { name: 'Ansal University' },
  { name: 'K R Mangalam University' },
  { name: 'GD Goenka University' },
  { name: 'YMCA University of Science & Technology' },
  { name: 'Manav Rachna University' },
  { name: 'MDU Rohtak' },
  { name: 'Sharda University' },
  { name: 'Noida International University' },
  { name: 'Lovely Professional University' },
  { name: 'Maharishi University' },
  { name: 'IIMT University' },
  { name: 'SGT University' },
  { name: 'DPG Degree College' },
  { name: 'JIMS Engineering' },
  { name: 'SRMS College of Engineering' },
  { name: 'Maharaja Agrasen College' },
  { name: 'Dronacharya College' },
  { name: 'Inderprastha University colleges' },
  { name: 'ITM University' },
  { name: 'Lingaya\'s University' },
  { name: 'G D Goenka Public School' },
  { name: 'BITS Pilani (Gurgaon campus)' },
  { name: 'NIT Kurukshetra' },
  { name: 'IGNOU' },
  { name: 'JMI' },
  { name: 'Jamia Hamdard' },
  { name: 'IP University' }
];

const connectDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.warn('MONGODB_URI is not defined. Database connection skipped.');
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    // eslint-disable-next-line no-console
    console.log('MongoDB connected successfully.');

    // Seed Courses
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      await Course.insertMany(defaultCourses);
      console.log('seeded default courses.');
    } else {
      // resync if count doesn't match full list
      const expectedCount = defaultCourses.length;
      if (courseCount < expectedCount) {
        console.log(`Currently has ${courseCount} courses, updating with missing ones...`);
        for (const item of defaultCourses) {
          await Course.updateOne(
            { name: item.name },
            { $setOnInsert: item },
            { upsert: true }
          );
        }
        console.log('Finished updating course seed.');
      }
    }

    // Seed Organizations
    const orgCount = await Organization.countDocuments();
    if (orgCount === 0) {
      await Organization.insertMany(defaultOrganizations);
      console.log('seeded default organizations.');
    } else {
      const expectedCount = defaultOrganizations.length;
      if (orgCount < expectedCount) {
        console.log(`Currently has ${orgCount} organizations, updating with missing ones...`);
        for (const item of defaultOrganizations) {
          await Organization.updateOne(
            { name: item.name },
            { $setOnInsert: item },
            { upsert: true }
          );
        }
        console.log('Finished updating organization seed.');
      }
    }

    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    console.warn('Continuing without database connection...');
    return false;
  }
};

module.exports = connectDB;
