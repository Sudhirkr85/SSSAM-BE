const Enquiry = require('../models/Enquiry');
const { generateEnquiryId } = require('../utils/enquiryId');

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
    return savedEnquiry;
  } catch (error) {
    throw new Error(`Failed to submit enquiry: ${error.message}`);
  }
};

const getEnquiryStatus = async (enquiryId) => {
  try {
    const enquiry = await Enquiry.findOne({ enquiryId });
    if (!enquiry) {
      throw new Error('Enquiry not found');
    }
    return enquiry;
  } catch (error) {
    throw new Error(`Failed to fetch enquiry: ${error.message}`);
  }
};

const getAllEnquiries = async (filters = {}) => {
  try {
    const enquiries = await Enquiry.find(filters).sort({ createdAt: -1 });
    return enquiries;
  } catch (error) {
    throw new Error(`Failed to fetch enquiries: ${error.message}`);
  }
};

const updateEnquiryStatus = async (enquiryId, status) => {
  try {
    const enquiry = await Enquiry.findOneAndUpdate(
      { enquiryId },
      { status },
      { new: true }
    );
    if (!enquiry) {
      throw new Error('Enquiry not found');
    }
    return enquiry;
  } catch (error) {
    throw new Error(`Failed to update enquiry: ${error.message}`);
  }
};

const deleteEnquiry = async (enquiryId) => {
  try {
    const enquiry = await Enquiry.findOneAndDelete({ enquiryId });
    if (!enquiry) {
      throw new Error('Enquiry not found');
    }
    return enquiry;
  } catch (error) {
    throw new Error(`Failed to delete enquiry: ${error.message}`);
  }
};

module.exports = {
  submitEnquiry,
  getEnquiryStatus,
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry
};
