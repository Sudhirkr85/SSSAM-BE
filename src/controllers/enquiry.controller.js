const {
  submitEnquiry,
  getEnquiryStatus,
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry
} = require('../services/enquiry.service');
const { sendSuccess } = require('../utils/response');

const bookDemoClass = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const enquiry = await submitEnquiry(req.body, ipAddress);

    return sendSuccess(res, 201, {
      message: 'Demo class enquiry submitted successfully',
      enquiryId: enquiry.enquiryId,
      status: enquiry.status
    });
  } catch (error) {
    return next(error);
  }
};

const getEnquiryStatusById = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;
    const enquiry = await getEnquiryStatus(enquiryId);

    return sendSuccess(res, 200, {
      enquiryId: enquiry.enquiryId,
      fullName: enquiry.fullName,
      phoneNumber: enquiry.phoneNumber,
      course: enquiry.course,
      customCourseName: enquiry.customCourseName || null,
      demoType: enquiry.demoType,
      message: enquiry.message,
      status: enquiry.status,
      submittedAt: enquiry.createdAt
    });
  } catch (error) {
    return next(error);
  }
};

const listAllEnquiries = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filters = {};

    if (status) {
      filters.status = status;
    }

    const enquiries = await getAllEnquiries(filters);

    return sendSuccess(res, 200, {
      total: enquiries.length,
      enquiries: enquiries.map(e => ({
        enquiryId: e.enquiryId,
        fullName: e.fullName,
        phoneNumber: e.phoneNumber,
        course: e.course,
        customCourseName: e.customCourseName || null,
        demoType: e.demoType,
        status: e.status,
        submittedAt: e.createdAt
      }))
    });
  } catch (error) {
    return next(error);
  }
};

const updateEnquiry = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;
    const { status } = req.body;
    const enquiry = await updateEnquiryStatus(enquiryId, status);

    return sendSuccess(res, 200, {
      message: 'Enquiry status updated successfully',
      enquiryId: enquiry.enquiryId,
      status: enquiry.status
    });
  } catch (error) {
    return next(error);
  }
};

const removeEnquiry = async (req, res, next) => {
  try {
    const { enquiryId } = req.params;
    await deleteEnquiry(enquiryId);

    return sendSuccess(res, 200, {
      message: 'Enquiry deleted successfully',
      enquiryId
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  bookDemoClass,
  getEnquiryStatusById,
  listAllEnquiries,
  updateEnquiry,
  removeEnquiry
};
