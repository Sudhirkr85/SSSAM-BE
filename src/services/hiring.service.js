const HiringRequest = require("../models/HiringRequest");
const { nanoid } = require("nanoid");

const submitHiringRequest = async (data, ipAddress) => {
  const requestId = "HIR-" + nanoid(8).toUpperCase();

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
