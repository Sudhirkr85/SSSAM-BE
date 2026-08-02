require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

const {
  getStudentEmailTemplate,
  getAdminEmailTemplate,
  getSeminarAdminEmailTemplate,
  getSeminarConfirmationEmailTemplate,
  getHiringAdminEmailTemplate,
  getHiringConfirmationEmailTemplate,
} = require("./emailTemplates");

// ===============================
// BREVO CONFIG
// ===============================
const client = SibApiV3Sdk.ApiClient.instance;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ===============================
// BASE EMAIL FUNCTION
// ===============================
async function sendEmail({ to, subject, html, useBcc = false }) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error("❌ BREVO_API_KEY is missing in process.env");
      throw new Error("BREVO_API_KEY is missing in environment variables");
    }
    client.authentications["api-key"].apiKey = apiKey;

    const emailData = {
      sender: {
        name: "SSSAM Academy",
        email: process.env.SMTP_FROM || "support.sssam@gmail.com",
      },
      subject,
      htmlContent: html,
    };

    // 👉 If multiple recipients & BCC enabled
    if (useBcc && Array.isArray(to)) {
      emailData.bcc = to.map((email) => ({ email }));
    } else {
      emailData.to = Array.isArray(to)
        ? to.map((email) => ({ email }))
        : [{ email: to }];
    }

    const response = await emailApi.sendTransacEmail(emailData);
    return response;
  } catch (error) {
    console.error("Brevo Email Error:", error.response?.body || error.message);
    throw error;
  }
}

// ===============================
// STUDENT EMAIL
// ===============================
async function sendStudentEmail(data) {
  return sendEmail({
    to: data.email,
    subject: data.subject,
    html: getStudentEmailTemplate(data),
  });
}

// ===============================
// ADMIN EMAIL (BCC)
// ===============================
async function sendAdminEmail(data) {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (admins.length === 0) {
    console.warn("No admin emails configured");
    return;
  }

  return sendEmail({
    to: admins,
    subject: "New Application Received",
    html: getAdminEmailTemplate(data),
    useBcc: true, // ✅ important
  });
}

// ===============================
// SEMINAR EMAILS
// ===============================
async function sendSeminarEmails(data) {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const promises = [];

  // Admin notification
  if (admins.length > 0) {
    promises.push(
      sendEmail({
        to: admins,
        subject: `New Seminar Request — ${data.collegeName}`,
        html: getSeminarAdminEmailTemplate(data),
        useBcc: true,
      })
    );
  }

  // Coordinator confirmation
  if (data.email) {
    promises.push(
      sendEmail({
        to: data.email,
        subject: "Seminar Request Received — SSSAM Academy",
        html: getSeminarConfirmationEmailTemplate(data),
      })
    );
  }

  await Promise.allSettled(promises);
}

// ===============================
// HIRING EMAILS
// ===============================
async function sendHiringEmails(data) {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const promises = [];

  // Admin notification
  if (admins.length > 0) {
    promises.push(
      sendEmail({
        to: admins,
        subject: `New Hiring Request — ${data.companyName}`,
        html: getHiringAdminEmailTemplate(data),
        useBcc: true,
      })
    );
  }

  // HR confirmation
  if (data.email) {
    promises.push(
      sendEmail({
        to: data.email,
        subject: "Hiring Request Received — SSSAM Academy",
        html: getHiringConfirmationEmailTemplate(data),
      })
    );
  }

  await Promise.allSettled(promises);
}

// ===============================
// EXPORTS
// ===============================
module.exports = {
  sendStudentEmail,
  sendAdminEmail,
  sendSeminarEmails,
  sendHiringEmails,
};
