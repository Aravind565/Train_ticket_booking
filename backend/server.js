const express = require('express');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const stationRoutes = require('./routes/stationRoutes');
const trainRoutes = require('./routes/trainRoutes');
const seatMapRoutes = require('./routes/seatMapRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const fareRoutes = require('./routes/fareRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Allow only your deployed frontend to access the backend
app.use(cors({
  origin: [
    "https://train-ticket-booking-frontend.vercel.app", // 🔹 change this to your actual Vercel frontend URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/seatmaps', seatMapRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/payment', paymentRoutes);

// ✅ Test Route
app.get('/', (req, res) => res.send('API is running'));

// ✅ Debug Route
app.get('/debug-db', async (req, res) => {
  try {
    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    const info = await admin.serverStatus();
    res.json({ host: info.host, version: info.version });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
