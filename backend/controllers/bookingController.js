const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking.js');
const Train = require('../models/Train.js');
const SeatMap = require('../models/SeatMap.js');
const Fare = require('../models/Fare.js');

// ======================
// HELPER FUNCTIONS
// ======================

function generatePNR() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function normalizePreference(pref) {
  if (!pref) return null;
  const p = pref.toLowerCase().trim();
  if (p.includes('side upper')) return 'Side Upper';
  if (p.includes('side lower')) return 'Side Lower';
  if (p.includes('lower')) return 'Lower';
  if (p.includes('middle')) return 'Middle';
  if (p.includes('upper')) return 'Upper';
  if (p.includes('window')) return 'Window';
  return 'None'; 
}

async function generateUniquePNR() {
  while (true) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const pnr = `PNR${timestamp}${random}`;
    const exists = await Booking.findOne({ pnr }).lean();
    if (!exists) return pnr;
  }
}

function validateBookingData(bookingData) {
  if (bookingData.paymentStatus === 'success' && !bookingData.paymentId) {
    throw new Error('Payment ID is required for successful payments');
  }

  const requiredFields = [
    'trainId', 'date', 'classType', 'passengers',
    'from', 'to', 'contact.phone', 'contact.email'
  ];

  const missingFields = requiredFields.filter(field => {
    const keys = field.split('.');
    let value = bookingData;
    for (const key of keys) {
      if (!value || value[key] === undefined) return true;
      value = value[key];
    }
    return false;
  });

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  bookingData.passengers.forEach((passenger, idx) => {
    if (!passenger.name || !passenger.age || !passenger.gender) {
      throw new Error(`Passenger at index ${idx} requires name, age, and gender`);
    }
  });
}

function formatBookingDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

async function executeWithRetry(fn, maxRetries = 3) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      if (err.errorLabels?.includes('TransientTransactionError') && attempts < maxRetries - 1) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100 * attempts));
      } else {
        throw err;
      }
    }
  }
}

// ======================
// SEAT ALLOCATION & WAITLIST FUNCTIONS
// ======================
async function getNextWaitlistNumber(trainNumber, travelDate, classType) {
  const startOfDay = new Date(travelDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(travelDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch only required fields to reduce DB load
  const bookings = await Booking.find({
    trainNumber,
    classType,
    travelDate: { $gte: startOfDay, $lte: endOfDay }
  }, 'passengers');

  let allWLNumbers = [];

  bookings.forEach(b => {
    b.passengers.forEach(p => {
      if (p.status === 'WAITLISTED' && typeof p.waitlistNumber === 'number') {
        allWLNumbers.push(p.waitlistNumber);
      }
    });
  });

  console.log('Waitlist numbers found:', allWLNumbers);

  return allWLNumbers.length === 0 ? 1 : Math.max(...allWLNumbers) + 1;
}




async function allocateSeats(classCoaches, passengers, seatMap ) {

  const availableSeats = [];
  classCoaches.forEach(coach => {
    coach.seats.forEach(seat => {
      if (!seat.isBooked) {
        availableSeats.push({ coach, seat });
      }
    });
  });

  passengers.forEach(p => {
    p.berthPreference = normalizePreference(p.berthPreference || '');
  });

  const confirmedPassengers = [];
  const waitlistedPassengers = [];

  for (const passenger of passengers) {
    let assignedSeatIndex = -1;

    if (passenger.berthPreference === 'None') {
      assignedSeatIndex = availableSeats.findIndex(({ seat }) => !seat.assigned);
    } else {
      assignedSeatIndex = availableSeats.findIndex(({ seat }) =>
        seat.preference === passenger.berthPreference && !seat.assigned
      );

      if (assignedSeatIndex === -1) {
        assignedSeatIndex = availableSeats.findIndex(({ seat }) => !seat.assigned);
      }
    }

    if (assignedSeatIndex !== -1) {
      const { coach, seat } = availableSeats[assignedSeatIndex];
      seat.assigned = true;

      // Double check if seat is booked in seatMap (in-memory check only)
      const seatBookedInDB = seatMap.coaches.some(c =>
        c.coachNumber === coach.coachNumber &&
        c.seats.some(s => s.seatNumber === seat.seatNumber && s.isBooked)
      );

      if (seatBookedInDB) {
        throw new Error(`Seat ${seat.seatNumber} in coach ${coach.coachNumber} already booked.`);
      }

      passenger.allocatedSeat = `${coach.coachNumber} - Seat ${seat.seatNumber}`;
      passenger.coachNumber = coach.coachNumber;
      passenger.seatNumber = seat.seatNumber;
      passenger.seatPreference = seat.preference;
      passenger.status = 'CONFIRMED';
      confirmedPassengers.push(passenger);
    } else {
      passenger.status = 'WAITLISTED';
      waitlistedPassengers.push(passenger);
    }
  }

  if (waitlistedPassengers.length > 0) {

    const nextWaitlistNumber = await getNextWaitlistNumber(
      seatMap.trainNumber,
      seatMap.date,
      classCoaches[0].classType
    );

     waitlistedPassengers.forEach((p, idx) => {
      const wlNum = nextWaitlistNumber + idx;
      p.waitlistNumber = wlNum;
      p.allocatedSeat = `WL${wlNum}`;
    });
  }

  return {
    confirmedPassengers,
    waitlistedPassengers
  };
}


// ======================
// CORE CONTROLLER FUNCTIONS
// ======================

const saveBookingWithPNR = async (bookingData) => {
  return executeWithRetry(async () => {
    validateBookingData(bookingData);

    const {
      userId,
      trainId,
      date,
      classType,
      passengers,
      from,
      to,
      contact,
      preferences,
      paymentId,
      orderId,
      paymentStatus,
    } = bookingData;

    const formattedDate = formatBookingDate(date);
    const train = await Train.findById(trainId);
    if (!train) throw new Error('Train not found');

    // Find seatMap and fareDoc without session
    const [seatMap, fareDoc] = await Promise.all([
      SeatMap.findOne({ trainNumber: train.trainNumber, date: formattedDate }),
      Fare.findOne({ trainNumber: train.trainNumber, from, to, classType }),
    ]);


    if (!seatMap) throw new Error('Seat map not found for this date');
    if (!fareDoc) throw new Error('Fare information not found');

    const classCoaches = seatMap.coaches.filter(coach => coach.classType === classType);
    if (classCoaches.length === 0) {
      throw new Error('No coaches available for this class');
    }

    const { confirmedPassengers, waitlistedPassengers } = await allocateSeats(
      classCoaches,
      passengers,
      seatMap
    );

    const pnr = await generateUniquePNR();
    const allPassengers = [...confirmedPassengers, ...waitlistedPassengers];

    const booking = new Booking({
      userId,
      trainId,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      from,
      to,
      classType,
      travelDate: formattedDate,
      passengers: allPassengers,
      contact,
      preferences: preferences || { autoUpgrade: false, insurance: false },
      totalFare: fareDoc.fareAmount * passengers.length,
      pnr,
      status: paymentStatus === 'success' ? 
        (waitlistedPassengers.length > 0 ? 'PARTIALLY_CONFIRMED' : 'CONFIRMED') : 'PENDING',
      paymentId,
      orderId,
      paymentStatus,
    });

    const savedBooking = await booking.save();

    // Update seatMap coaches/seats without session
    for (const passenger of confirmedPassengers) {
      const coach = seatMap.coaches.find(c => c.coachNumber === passenger.coachNumber);
      if (!coach) throw new Error(`Coach ${passenger.coachNumber} not found`);

      const seat = coach.seats.find(s => s.seatNumber === passenger.seatNumber);
      if (!seat) throw new Error(`Seat ${passenger.seatNumber} not found in coach ${passenger.coachNumber}`);

      seat.isBooked = true;
      seat.bookingId = savedBooking._id;
    }

    await seatMap.save();

    return savedBooking;
  });
};


const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    // Calculate refund (simplified example)
    const hoursUntilDeparture = Math.floor((booking.travelDate - new Date()) / (1000 * 60 * 60));
    let refundPercentage = hoursUntilDeparture > 48 ? 0.75 :
                         hoursUntilDeparture > 24 ? 0.50 :
                         hoursUntilDeparture > 12 ? 0.25 : 0;
    const refundAmount = booking.totalFare * refundPercentage;

    // Free up seats
    const seatMap = await SeatMap.findOne({
      trainNumber: booking.trainNumber,
      date: booking.travelDate
    });

    if (seatMap) {
      for (const passenger of booking.passengers.filter(p => p.status === 'CONFIRMED')) {
        const coach = seatMap.coaches.find(c => c.coachNumber === passenger.coachNumber);
        if (coach) {
          const seat = coach.seats.find(s => s.seatNumber === passenger.seatNumber);
          if (seat) {
            seat.isBooked = false;
            seat.bookingId = null;
          }
        }
      }
      await seatMap.save();
    }

    // Update booking status
    booking.status = 'CANCELLED';
    booking.passengers.forEach(p => p.status = 'CANCELLED');
    booking.refundAmount = refundAmount;
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      refundAmount,
      pnr: booking.pnr
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      code: 'CANCELLATION_FAILED'
    });
  }
};


const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('trainId', 'trainNumber trainName departureTime arrivalTime')
      .populate('userId', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({
      pnr: booking.pnr,
      train: booking.trainId,
      user: booking.userId,
      from: booking.from,
      to: booking.to,
      travelDate: booking.travelDate,
      classType: booking.classType,
      passengers: booking.passengers,
      totalFare: booking.totalFare,
      status: booking.status,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error retrieving booking',
      error: err.message,
    });
  }
};

// const getUserBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ userId: req.params.userId })
//       .sort({ createdAt: -1 })
//       .populate('trainId', 'trainNumber trainName');

//     res.json(bookings.map(b => ({
//       pnr: b.pnr,
//       train: b.trainId,
//       travelDate: b.travelDate,
//       from: b.from,
//       to: b.to,
//       classType: b.classType,
//       totalFare: b.totalFare,
//       status: b.status,
//       createdAt: b.createdAt,
//     })));
//   } catch (err) {
//     res.status(500).json({
//       message: 'Error fetching bookings',
//       error: err.message,
//     });
//   }
// };






const getUserBookings = async (req, res) => {
  try {
    // Get user ID from JWT token
    const userId = req.user?.id;
    console.log('User ID from token:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    // Query bookings using the userId directly (Mongoose handles string -> ObjectId)
    const bookings = await Booking.find({ userId })
      .sort({ travelDate: -1, departureTime: -1 })
      .populate('trainId', 'trainNumber trainName')
      .lean();

    console.log('Bookings fetched:', bookings);

    // Format the response
    const result = bookings.map(b => ({
      bookingId: b._id,
      pnr: b.pnr,
      trainNumber: b.trainId?.trainNumber || 'N/A',
      trainName: b.trainId?.trainName || 'N/A',
      from: b.from,
      to: b.to,
      travelDate: b.travelDate,
      classType: b.classType,
      status: b.status,
      totalFare: b.totalFare,
        passengers: b.passengers,
      createdAt: b.createdAt
    }));

    return res.json(result);

  } catch (err) {
    console.error('Error fetching user bookings:', err);
    return res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

module.exports = {
  getUserBookings,
};



const getBookingInfo = async (req, res) => {
  try {
    const { trainId } = req.params;
    const { from, to, classType, date } = req.query;

    if (!date || isNaN(new Date(date))) {
      return res.status(400).json({ message: 'Invalid or missing date parameter' });
    }
    const formattedDate = formatBookingDate(date);
    const train = await Train.findById(trainId);

    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    const [seatMap, fare, lastWaitlist] = await Promise.all([
      SeatMap.findOne({ trainNumber: train.trainNumber, date: formattedDate }),
      Fare.findOne({ trainNumber: train.trainNumber, from, to, classType }),
      Booking.findOne({
        trainNumber: train.trainNumber,
        travelDate: formattedDate,
        classType,
        'passengers.status': 'WAITLISTED'
      }).sort({ 'passengers.waitlistNumber': -1 }).limit(1)
    ]);

    let availability = 0;
    if (seatMap) {
      seatMap.coaches
        .filter(coach => coach.classType === classType)
        .forEach(coach => {
          availability += coach.seats.filter(seat => !seat.isBooked).length;
        });
    }

    if (!fare) {
      return res.status(404).json({ message: 'Fare not found for this route/class' });
    }

    let nextWaitlistNumber = 1;
    if (lastWaitlist) {
      const highestWL = Math.max(...lastWaitlist.passengers
        .filter(p => p.status === 'WAITLISTED')
        .map(p => p.waitlistNumber));
      nextWaitlistNumber = highestWL + 1;
    }

    res.json({
      trainId: train._id,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      from,
      to,
      classType,
      availability,
      nextWaitlistNumber: availability === 0 ? nextWaitlistNumber : null,
      fare: fare.fareAmount,
      date: formattedDate,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching booking info',
      error: err.message,
    });
  }
};

const getWaitlistPosition = async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      pnr: req.params.pnr,
      userId: req.user.id 
    }).populate('trainId', 'trainNumber trainName');

    if (!booking) {
      throw new Error('Booking not found');
    }

    const waitlistedPassengers = booking.passengers.filter(p => p.status === 'WAITLISTED');
    if (waitlistedPassengers.length === 0) {
      throw new Error('No waitlisted passengers in this booking');
    }

    const waitlistCounts = await Booking.aggregate([
      {
        $match: {
          trainNumber: booking.trainNumber,
          travelDate: booking.travelDate,
          classType: booking.classType,
          'passengers.status': 'WAITLISTED'
        }
      },
      { $unwind: '$passengers' },
      { $match: { 'passengers.status': 'WAITLISTED' } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const totalWaitlisted = waitlistCounts[0]?.count || 0;

    res.json({
      pnr: booking.pnr,
      train: booking.trainId,
      travelDate: booking.travelDate,
      classType: booking.classType,
      waitlistedPassengers: waitlistedPassengers.map(p => ({
        name: p.name,
        currentWaitlistNumber: p.waitlistNumber,
        position: p.waitlistNumber - 1,
        totalWaitlisted
      })),
      lastUpdated: new Date()
    });
  } catch (err) {
    res.status(400).json({ 
      message: err.message,
      code: 'WL_POSITION_ERROR'
    });
  }
};

module.exports = {
  saveBookingWithPNR,
  getBookingById,
  getUserBookings,
  getBookingInfo,
  cancelBooking,
  getWaitlistPosition
};