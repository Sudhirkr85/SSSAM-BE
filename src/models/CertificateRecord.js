const mongoose = require("mongoose");

const certificateRecordSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
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
    dateOfBirth: {
      type: Date,
      required: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    certificateType: {
      type: String,
      required: true,
      enum: [
        "Training",
        "Workshop",
        "Internship",
        "Industrial Training",
        "Academic Training",
        "Corporate Training"
      ],
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    pdfPath: {
      type: String,
      default: null,
    },
    qualification: {
      type: String,
      default: null,
      trim: true,
    },
    instituteName: {
      type: String,
      default: "SSSAM Academy",
    },
    status: {
      type: String,
      default: "Verified",
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CertificateApplication",
      required: true,
    },

    // 🔥 NEW ADMIN FIELDS
    adminStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CertificateRecord", certificateRecordSchema);
