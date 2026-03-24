const nodemailer = require('nodemailer');
require('dotenv').config();

const {
  getStudentEmailTemplate,
  getAdminEmailTemplate
} = require('./emailTemplates');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


// ===============================
// BASE EMAIL
// ===============================
async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  });
}


// ===============================
// STUDENT EMAIL
// ===============================
async function sendStudentEmail(data) {
  return sendEmail({
    to: data.email,
    subject: data.subject,
    html: getStudentEmailTemplate(data)
  });
}


// ===============================
// ADMIN EMAIL
// ===============================
async function sendAdminEmail(data) {
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

  return sendEmail({
    to: admins,
    subject: "New Application Received",
    html: getAdminEmailTemplate(data)
  });
}

module.exports = {
  sendStudentEmail,
  sendAdminEmail
};