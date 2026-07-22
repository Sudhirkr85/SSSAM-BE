const mongoose = require("mongoose");

const hiringRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    hrName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
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
    techDomain: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    adminStatus: {
      type: String,
      enum: ["new", "contacted", "hired", "cancelled"],
      default: "new",
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    comment: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HiringRequest", hiringRequestSchema);
