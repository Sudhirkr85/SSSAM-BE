const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const CertificateApplication = require("../models/CertificateApplication");

const testData = [
  {
    applicationId: "APP1001",
    fullName: "Aryan Sharma",
    phoneNumber: "9876543210",
    email: "aryan@example.com",
    dateOfBirth: new Date("2002-05-15"),
    address: "BCA Student",
    course: "Python Programming & AI",
    certificateType: "Training",
    duration: "3 Months",
    status: "Approved",
    certificateNumber: "SSSAM/CERT/738540",
    issueDate: new Date("2026-04-06")
  },
  {
    applicationId: "APP1002",
    fullName: "Himanshi Yadav",
    phoneNumber: "9988776655",
    email: "himanshi@example.com",
    dateOfBirth: new Date("2003-09-20"),
    address: "MCA student",
    course: "Cybersecurity & Ethical Hacking (IITM (Institute of Information Technology & Management, Janakpuri, New Delhi))",
    certificateType: "Training",
    duration: "100 Hours | Duration: June 16th - July 31st 2025",
    status: "Approved",
    certificateNumber: "SSSAM/CERT/738542",
    issueDate: new Date("2026-04-06")
  },
  {
    applicationId: "APP1003",
    fullName: "Rohan Verma",
    phoneNumber: "9517447689",
    email: "rohan@example.com",
    dateOfBirth: new Date("2001-12-05"),
    address: "B.Tech Student",
    course: "Data Science & Data Analytics (Google India (Gurugram))",
    certificateType: "Corporate Training",
    duration: "120 Hours | Duration: July 01, 2025 - August 15, 2025",
    status: "Approved",
    certificateNumber: "SSSAM/CERT/738545",
    issueDate: new Date("2026-04-10")
  },
  {
    applicationId: "APP1004",
    fullName: "Sneha Gupta",
    phoneNumber: "9312048596",
    email: "sneha@example.com",
    dateOfBirth: new Date("2004-02-28"),
    address: "Graphic Designer",
    course: "Figma Prototyping & UI/UX Design",
    certificateType: "Workshop",
    duration: "4 Days | Duration: April 02, 2026 - April 05, 2026",
    status: "Approved",
    certificateNumber: "SSSAM/CERT/CERT000172",
    issueDate: new Date("2026-04-06")
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/institute_management";
    console.log("Connecting to Database:", mongoUri);
    await mongoose.connect(mongoUri);
    
    console.log("Cleaning old test applications...");
    await CertificateApplication.deleteMany({
      applicationId: { $in: ["APP1001", "APP1002", "APP1003", "APP1004"] }
    });

    console.log("Inserting new test applications...");
    await CertificateApplication.insertMany(testData);

    console.log("Database seeded successfully! 🎉");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
