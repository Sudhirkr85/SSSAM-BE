const mongoose = require('mongoose');

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
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    console.warn('Continuing without database connection...');
    return false;
  }
};

module.exports = connectDB;
