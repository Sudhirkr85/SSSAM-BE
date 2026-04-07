const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    enquiryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
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
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    customCourseName: {
      type: String,
      trim: true,
      required: function () {
        return this.course === "Others";
      },
    },
    demoType: {
      type: String,
      required: true,
      enum: ["Online", "Live Classes", "Offline (Gurugram)"],
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },

    // OLD STATUS (DO NOT TOUCH)
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed", "Cancelled"],
      default: "Pending",
    },

    ipAddress: {
      type: String,
      trim: true,
    },

    // 🔥 NEW ADMIN FIELDS
    adminStatus: {
      type: String,
      enum: [
        "new",
        "contacted",
        "follow_up",
        "converted",
        "rejected",
        "done",
      ],
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
    interestStatus: {
      type: String,
      enum: ["interested", "not_interested"],
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Enquiry", enquirySchema);
