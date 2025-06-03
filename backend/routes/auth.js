const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Updated Registration route with full fields
router.post('/register', async (req, res) => {
  const { userName, fullName, email, password, confirmPassword, mobile, age } = req.body;

  // Validate all fields
  if (!userName || !fullName || !email || !password || !confirmPassword || !mobile || !age) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Password match check
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Check if the email already exists
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingUsername = await User.findOne({ userName });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      userName,
      fullName,
      email,
      mobile,
      age,
      password: hashedPassword,
    });

    await user.save();
    res.json({ message: 'Registration successful', user });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Prepare user data to send back (exclude password)
    const userData = {
      _id: user._id,
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      age: user.age,
      isAdmin: user.isAdmin,
    };

    res.json({ token, user: userData });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


module.exports = router;
