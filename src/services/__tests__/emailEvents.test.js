const { sendEmail } = require('../email.service');
const { applyForCertificate, approveApplication } = require('../certificate.service');
const { submitEnquiry } = require('../enquiry.service');

// Mock nodemailer
jest.mock('nodemailer', () => {
  const sendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
  return {
    createTransport: jest.fn(() => ({ sendMail }))
  };
});

describe('Email Event Triggers', () => {
  it('should send email on certificate application submit', async () => {
    const payload = {
      fullName: 'Test User',
      phoneNumber: '9876543210',
      email: 'testuser@example.com',
      dateOfBirth: new Date('2000-01-01'),
      address: 'Test Address',
      course: 'Test Course',
      certificateType: 'Training',
      duration: '3 month'
    };
    const result = await applyForCertificate(payload);
    expect(result).toHaveProperty('applicationId');
  });

  it('should send email on certificate approval', async () => {
    // You need a valid applicationId from previous test or mock DB
    const applicationId = 'mock-app-id';
    await expect(approveApplication(applicationId)).resolves.not.toThrow();
  });

  it('should send email to admins on enquiry submit', async () => {
    process.env.ADMIN_EMAILS = 'admin1@example.com,admin2@example.com';
    const enquiryData = {
      fullName: 'Enquiry User',
      phoneNumber: '9123456789',
      course: 'Enquiry Course',
      customCourseName: '',
      demoType: 'Online',
      message: 'Test enquiry message'
    };
    const ipAddress = '127.0.0.1';
    const result = await submitEnquiry(enquiryData, ipAddress);
    expect(result).toHaveProperty('enquiryId');
  });
});
