const mongoose = require("mongoose");

const LegacyCertificateSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      set: function (val) {
        if (!val) return val;
        return val
          .trim()
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      }
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    trainingType: {
      type: String,
      trim: true,
      default: "Training",
    },
    organization: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    sourceNote: {
      type: String,
      default: "Imported from pre-2026 records",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LegacyCertificate", LegacyCertificateSchema);
