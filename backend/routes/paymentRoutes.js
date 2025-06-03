const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

const Booking = require('../models/Booking');
const { saveBookingWithPNR } = require('../controllers/bookingController');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware to validate amount
const validateAmount = (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ 
      success: false,
      error: 'Amount is required and must be a number' 
    });
  }
  
  if (amount <= 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Amount must be greater than 0' 
    });
  }
  
  next();
};

// Create Razorpay order
router.post('/create-order', validateAmount, async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);
    
    res.json({ 
      success: true,
      order 
    });
    
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create payment order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/verify-payment', async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    bookingData
  } = req.body;

  // 1. First validate payment fields
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ 
      success: false,
      error: 'Missing payment verification data' 
    });
  }

  // 2. Validate bookingData structure
  if (!bookingData || typeof bookingData !== 'object') {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid booking data format' 
    });
  }

  // 3. Map travelDate to date if needed
  if (bookingData.travelDate && !bookingData.date) {
    bookingData.date = bookingData.travelDate;
  }

  // 4. Verify payment signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid payment signature' 
    });
  }

  try {
    // 5. Prepare complete booking data
    const completeBookingData = {
      ...bookingData,
      // Ensure these fields match what saveBookingWithPNR expects
      date: bookingData.date || bookingData.travelDate,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentStatus: 'success'
    };

    // 6. Save the booking
    const savedBooking = await saveBookingWithPNR(completeBookingData);

    return res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      bookingId: savedBooking._id,
      pnr: savedBooking.pnr,
      paymentId: razorpay_payment_id,
      amount: savedBooking.totalFare,

        passengers: savedBooking.passengers,
  trainName: savedBooking.trainName,
  route: savedBooking.route,
  date: savedBooking.date,
  classType: savedBooking.classType,
  totalFare: savedBooking.totalFare
    });

  } catch (error) {
    console.error('Full error details:', {
      error: error.stack || error,
      receivedData: {
        payment: {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature
        },
        bookingData
      }
    });

    // More specific error handling
    const statusCode = error.message.includes('validation') ? 400 : 500;
    const errorMessage = statusCode === 400 
      ? 'Booking validation failed: ' + error.message
      : 'Failed to process booking';

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message
      })
    });
  }
});
module.exports = router;