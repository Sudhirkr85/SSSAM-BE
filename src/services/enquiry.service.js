const Enquiry = require("../models/Enquiry");
const { generateEnquiryId } = require("../utils/enquiryId");

const submitEnquiry = async (enquiryData, ipAddress) => {
  const enquiryId = generateEnquiryId();

  const enquiry = new Enquiry({
    enquiryId,
    fullName: enquiryData.fullName,
    phoneNumber: enquiryData.phoneNumber,
    course: enquiryData.course,
    customCourseName: enquiryData.customCourseName || "",
    demoType: enquiryData.demoType,
    message: enquiryData.message || "",
    status: "Pending",
    ipAddress,
  });

  return await enquiry.save(); // ✅ ONLY DB
};

const getEnquiryStatus = async (enquiryId) => {
  const enquiry = await Enquiry.findOne({ enquiryId });
  if (!enquiry) throw new Error("Enquiry not found");
  return enquiry;
};

const getAllEnquiries = async (filters = {}) => {
  return await Enquiry.find(filters).sort({ createdAt: -1 });
};

const updateEnquiryStatus = async (enquiryId, status) => {
  const enquiry = await Enquiry.findOneAndUpdate(
    { enquiryId },
    { status },
    { new: true },
  );
  if (!enquiry) throw new Error("Enquiry not found");
  return enquiry;
};

const deleteEnquiry = async (enquiryId) => {
  const enquiry = await Enquiry.findOneAndDelete({ enquiryId });
  if (!enquiry) throw new Error("Enquiry not found");
  return enquiry;
};

module.exports = {
  submitEnquiry,
  getEnquiryStatus,
  getAllEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
};
