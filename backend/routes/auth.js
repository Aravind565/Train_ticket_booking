const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ REGISTRATION ROUTE - FULLY FIXED WITH ERROR HANDLING
router.post('/register', async (req, res) => {
  try {
    console.log('=== Registration Request ===');
    console.log('Body:', req.body);

    const { userName, fullName, email, password, confirmPassword, mobile, age } = req.body;

    // ✅ Validate all fields exist
    if (!userName || !fullName || !email || !password || !confirmPassword || !mobile || !age) {
      console.log('Missing fields');
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          userName: !userName,
          fullName: !fullName,
          email: !email,
          password: !password,
          confirmPassword: !confirmPassword,
          mobile: !mobile,
          age: !age
        }
      });
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // ✅ Validate mobile (10 digits only)
    if (!/^\d{10}$/.test(mobile)) {
      console.log('Invalid mobile:', mobile);
      return res.status(400).json({ message: 'Mobile must be 10 digits' });
    }

    // ✅ Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      console.log('Invalid age:', age);
      return res.status(400).json({ message: 'Age must be between 1 and 120' });
    }

    // ✅ Validate password length
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // ✅ Validate passwords match
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // ✅ Check if email already exists
    console.log('Checking if email exists:', email);
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      console.log('Email already exists');
      return res.status(400).json({ message: 'Email already registered' });
    }

    // ✅ Check if username already exists
    console.log('Checking if username exists:', userName);
    const existingUsername = await User.findOne({ userName: userName.toLowerCase().trim() });
    if (existingUsername) {
      console.log('Username already exists');
      return res.status(400).json({ message: 'Username already taken' });
    }

    // ✅ Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user object
    console.log('Creating user object...');
    const user = new User({
      userName: userName.toLowerCase().trim(),
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      age: ageNum,
      password: hashedPassword,
    });

    // ✅ Save to database
    console.log('Saving to database...');
    await user.save();
    console.log('User saved successfully:', user._id);

    // ✅ Return success response
    return res.status(201).json({ 
      message: 'Registration successful',
      user: {
        _id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        age: user.age
      }
    });

  } catch (error) {
    console.error('=== Registration Error ===');
    console.error('Error Message:', error.message);
    console.error('Error Name:', error.name);
    console.error('Error Stack:', error.stack);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('Validation Error Details:', error.errors);
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: messages
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      console.error('Duplicate Key Error:', error.keyPattern);
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists`
      });
    }

    // Generic server error
    console.error('Generic Error');
    return res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

// ✅ LOGIN ROUTE - WITH ERROR HANDLING
router.post('/login', async (req, res) => {
  try {
    console.log('=== Login Request ===');
    console.log('Body:', req.body);

    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    console.log('Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Create JWT token
    console.log('Creating JWT token...');
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user data
    const userData = {
      _id: user._id,
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      age: user.age,
      isAdmin: user.isAdmin,
    };

    console.log('Login successful for user:', user.email);
    return res.status(200).json({ token, user: userData });

  } catch (error) {
    console.error('=== Login Error ===');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);

    return res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;