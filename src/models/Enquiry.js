const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    enquiryId: {
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
    course: {
      type: String,
      required: true,
      trim: true
    },
    customCourseName: {
      type: String,
      trim: true,
      required: function requiredCustomCourseName() {
        return this.course === 'Others';
      }
    },
    demoType: {
      type: String,
      required: true,
      enum: ['Online', 'Live Classes', 'Offline (Gurugram)']
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    ipAddress: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
