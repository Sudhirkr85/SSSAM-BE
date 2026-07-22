const SeminarBooking = require("../models/SeminarBooking");
const { nanoid } = require("nanoid");

const submitSeminarBooking = async (data, ipAddress) => {
  const bookingId = "SEM-" + nanoid(8).toUpperCase();

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
