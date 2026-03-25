require('dotenv').config();

const {
  sendStudentEmail,
  sendAdminEmail
} = require('./emailService');

async function runEmailTest() {
  try {
    const baseData = {
      name: "Mohit Yadav",
      email: "ymohityadav334@gmail.com", // apna email
      phoneNumber: "9876543210",
      course: "Full Stack Development",
      certificateType: "Professional",
      applicationId: "APP123456",
      certificateNumber: "CERT789456",
      duration: "6 Months",
      date: new Date().toLocaleString()
    };

    // ===============================
    // 🟡 APPLY (PENDING)
    // ===============================
    console.log("🚀 Testing APPLY (Pending) Email...");
    await sendStudentEmail({
      ...baseData,
      status: "Pending",
      subject: "Application Submitted - SSSAM Academy",
      statusMessage: "Your application has been successfully submitted. You can track it using your Application ID."
    });

    // ===============================
    // 🟢 APPROVED
    // ===============================
    console.log("🚀 Testing APPROVED Email...");
    await sendStudentEmail({
      ...baseData,
      status: "Approved",
      subject: "Application Approved - SSSAM Academy",
      statusMessage: "Your application has been approved. Your certificate has been generated."
    });

    // ===============================
    // 🔴 REJECTED
    // ===============================
    console.log("🚀 Testing REJECTED Email...");
    await sendStudentEmail({
      ...baseData,
      status: "Rejected",
      subject: "Application Update - SSSAM Academy",
      statusMessage: "Your application has been rejected. Please contact support for more details."
    });

    // ===============================
    // 👨‍💼 ADMIN EMAIL
    // ===============================
    console.log("🚀 Testing ADMIN Email...");
    await sendAdminEmail(baseData);

    console.log("✅ ALL EMAIL TESTS COMPLETED");

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

runEmailTest();