const Enquiry = require('../models/Enquiry');
const { generateEnquiryId } = require('../utils/enquiryId');
const { sendEmail } = require('./email.service');
const { getAdminEmailTemplate } = require('./emailTemplates');

const submitEnquiry = async (enquiryData, ipAddress) => {
  try {
    const enquiryId = generateEnquiryId();

    const enquiry = new Enquiry({
      enquiryId,
      fullName: enquiryData.fullName,
      phoneNumber: enquiryData.phoneNumber,
      course: enquiryData.course,
      customCourseName: enquiryData.customCourseName || '',
      demoType: enquiryData.demoType,
      message: enquiryData.message || '',
      status: 'Pending',
      ipAddress
    });

    const savedEnquiry = await enquiry.save();

    // ✅ NON-BLOCKING ADMIN EMAIL (TEMPLATE USE)
    if (process.env.ADMIN_EMAILS) {
      const adminEmails = process.env.ADMIN_EMAILS
        .split(',')
        .map(e => e.trim())
        .filter(Boolean);

      if (adminEmails.length > 0) {
        setImmediate(() => {
          sendEmail({
            to: adminEmails,
            subject: 'New Enquiry Received',
            html: getAdminEmailTemplate({
              fullName: enquiryData.fullName,
              email: enquiryData.email,
              phoneNumber: enquiryData.phoneNumber,
              course: enquiryData.course,
              demoType: enquiryData.demoType,
              message: enquiryData.message,
              date: new Date().toLocaleString()
            })
          }).catch((err) =>
            console.error('Admin email send error (enquiry):', err)
          );
        });
      }
    }

    return savedEnquiry;

  } catch (error) {
    throw new Error(`Failed to submit enquiry: ${error.message}`);
  }
};

const getEnquiryStatus = async (enquiryId) => {
  const enquiry = await Enquiry.findOne({ enquiryId });
  if (!enquiry) throw new Error('Enquiry not found');
  return enquiry;
};

const getAllEnquiries = async (filters = {}) => {
  return await Enquiry.find(filters).sort({ createdAt: -1 });
};

const updateEnquiryStatus = async (enquiryId, status) => {
  const enquiry = await Enquiry.findOneAndUpdate(
    { enquiryId },
    { status },
    { new: true }
  );
  if (!enquiry) throw new Error('Enquiry not found');
  return enquiry;
};

const deleteEnquiry = async (enquiryId) => {
  const enquiry = await Enquiry.findOneAndDelete({ enquiryId });
  if (!enquiry) throw new Error('Enquiry not found');
  return enquiry;
};

module.exports = {
  submitEnquiry,
  getEnquiryStatus,
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry
};