const mongoose = require('mongoose');

const connectDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  await mongoose.connect(MONGODB_URI, {
    autoIndex: true
  });

  // eslint-disable-next-line no-console
  console.log('MongoDB connected successfully.');
};

module.exports = connectDB;
