const mongoose = require('mongoose');

const certificateApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    certificateType: {
      type: String,
      required: true,
      enum: ['Training', 'Workshop', 'Internship']
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    certificateNumber: {
      type: String,
      default: null,
      trim: true
    },
    issueDate: {
      type: Date,
      default: null
    },
    remarks: {
      type: String,
      default: null,
      trim: true
    }
  },
  { timestamps: true }
);

certificateApplicationSchema.index({ fullName: 1, email: 1, phoneNumber: 1 });

module.exports = mongoose.model('CertificateApplication', certificateApplicationSchema);
