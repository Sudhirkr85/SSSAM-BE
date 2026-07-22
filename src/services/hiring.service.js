const HiringRequest = require("../models/HiringRequest");
const crypto = require("crypto");

const generateId = () => crypto.randomBytes(4).toString("hex").toUpperCase();

const submitHiringRequest = async (data, ipAddress) => {
  const requestId = "HIR-" + generateId();

  const request = new HiringRequest({
    requestId,
    companyName: data.companyName,
    hrName: data.hrName,
    mobileNumber: data.mobileNumber,
    email: data.email,
    techDomain: data.techDomain,
    ipAddress,
  });

  await request.save();
  return request;
};

module.exports = { submitHiringRequest };
