const SeminarBooking = require("../models/SeminarBooking");
const crypto = require("crypto");

const generateId = () => crypto.randomBytes(4).toString("hex").toUpperCase();

const submitSeminarBooking = async (data, ipAddress) => {
  const bookingId = "SEM-" + generateId();

  const booking = new SeminarBooking({
    bookingId,
    collegeName: data.collegeName,
    coordinatorName: data.coordinatorName,
    mobileNumber: data.mobileNumber,
    email: data.email || null,
    topic: data.topic,
    ipAddress,
  });

  await booking.save();
  return booking;
};

module.exports = { submitSeminarBooking };
