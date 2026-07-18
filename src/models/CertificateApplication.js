const mongoose = require("mongoose");

const certificateApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
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
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    qualification: {
      type: String,
      required: false,
      trim: true,
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

    // ✅ UPDATED STATUS (support both old + new)
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "pending",
        "approved",
        "rejected",
      ],
      default: "Pending",
    },

    certificateNumber: {
      type: String,
      default: null,
      trim: true,
    },
    issueDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: null,
      trim: true,
    },

    // 🔥 NEW FIELDS (ADMIN)
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

certificateApplicationSchema.index({ fullName: 1, email: 1, phoneNumber: 1 });

module.exports = mongoose.model(
  "CertificateApplication",
  certificateApplicationSchema,
);
