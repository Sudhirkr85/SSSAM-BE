const mongoose = require('mongoose');
const Organization = require('../models/Organization');

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
