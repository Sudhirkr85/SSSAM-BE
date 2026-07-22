const mongoose = require("mongoose");

const seminarBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    coordinatorName: {
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
      trim: true,
      lowercase: true,
      default: null,
    },
    topic: {
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
      enum: ["new", "contacted", "scheduled", "cancelled"],
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

module.exports = mongoose.model("SeminarBooking", seminarBookingSchema);
