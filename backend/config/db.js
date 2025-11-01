const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI); // Add this line to debug
    await mongoose.connect('mongodb+srv://aravind_565:aravind565AG@cluster0.n9xaz.mongodb.net/train?retryWrites=true&w=majority&appName=Cluster0');

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
