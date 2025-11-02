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

// ✅ CORS Configuration - MUST be before routes
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "https://trainticketbooking-tau.vercel.app",
      "https://trainticketbooking-git-main-aravind-as-projects-a3ae63c0.vercel.app"
    ];
    
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked origin:", origin);
      callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ Handle preflight requests - MUST be before routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Add logging middleware to see incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

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

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`)); // ✅ FIXED THIS LINE