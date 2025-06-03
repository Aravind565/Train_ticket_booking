const express = require('express');
const {
  saveBookingWithPNR,
  getBookingById,
  getUserBookings,
  getBookingInfo,
  cancelBooking,
  getWaitlistPosition
} = require('../controllers/bookingController.js');

const verifyToken = require('../middleware/auth'); // JWT middleware
const router = express.Router();

// ✅ Create a new booking (Authenticated)
router.post('/', verifyToken, async (req, res) => {
  try {
    const bookingData = { ...req.body, userId: req.user.id };
    const booking = await saveBookingWithPNR(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking Error:', {
      error: error.toString(),
      receivedData: req.body,
    });
    res.status(400).json({ message: error.message });
  }
});

// ✅ Get booking info for a specific train on a given date and class
// Example: /api/booking/train/682f0c63bee299fd02254475/booking-info?from=CBE&to=TPJ&classType=SL&date=2025-05-27
router.get('/train/:trainId/booking-info', getBookingInfo);

// ✅ Get all bookings made by a specific user (Authenticated)
router.get('/user/:userId', verifyToken, getUserBookings);

// ✅ Get booking details by booking ID (Authenticated)
router.get('/:id', verifyToken, getBookingById);

// ✅ Cancel a booking by ID (Authenticated) [Optional if used]
router.delete('/:id', verifyToken, cancelBooking);

// ✅ Get waitlist position by PNR (Authenticated) [Optional if used]
router.get('/waitlist/:pnr', verifyToken, getWaitlistPosition);

module.exports = router;
