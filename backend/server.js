const express = require('express');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth'); // Authentication routes
const userRoutes = require('./routes/user'); // User routes
const stationRoutes = require('./routes/stationRoutes');
const trainRoutes = require('./routes/trainRoutes');
const seatMapRoutes = require('./routes/seatMapRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const fareRoutes = require('./routes/fareRoutes');

const paymentRoutes = require('./routes/paymentRoutes');



const app = express();

// Connect to MongoDB
connectDB();

  
  app.use(cors()); // Allow cross-origin requests
  app.use(express.json()); // To parse JSON request body
  
  // Routes
  app.use('/api/auth', authRoutes); // Use the authentication routes
  app.use('/api/user', userRoutes); // Use the user-related routes
  app.use('/api/trains', trainRoutes);
  app.use('/api/seatmaps', seatMapRoutes);
  app.use('/api/booking', bookingRoutes);
  app.use('/api/fares', fareRoutes);
  app.use('/api/stations', stationRoutes);
  app.use('/api/payment', paymentRoutes);


// Test Route to Check if Server is Running
app.get('/', (req, res) => res.send('API is running'));
console.log("Registering /debug-db route");

app.get('/debug-db', async (req, res) => {
  try {
    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    const info = await admin.serverStatus();
    res.json({ host: info.host, version: info.version });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Port to Run the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
