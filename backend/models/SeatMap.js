const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true }, // e.g., "1", "2", ...
  preference: { type: String, required: true }, // Window, Middle, etc.
  isBooked: { type: Boolean, default: false },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }
});

const coachSchema = new mongoose.Schema({
  coachNumber: { type: String, required: true }, // D1, C1, S1, etc.
  classType: { type: String, required: true },
  seats: { type: [seatSchema], required: true }
});

const seatMapSchema = new mongoose.Schema({
  trainNumber: { type: Number, required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  coaches: { type: [coachSchema], required: true }
});

// Check if model already exists, else create it
const SeatMap = mongoose.models.SeatMap || mongoose.model('SeatMap', seatMapSchema);

module.exports = SeatMap;
