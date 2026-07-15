const mongoose = require('mongoose');

const PlacementSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogoUrl: {
      type: String,
      default: '',
    },
    packageLPA: {
      type: Number,
      required: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    placedYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Placement', PlacementSchema);
