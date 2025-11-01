  const express = require('express');
  const router = express.Router();
  const verifyToken = require('../middleware/auth'); // JWT verification middleware
  const User = require('../models/User');

  // Route 1: Get logged-in user's data
  router.get('/', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ✅ Route 2: Get all users (admin only)
  router.get('/all', verifyToken, async (req, res) => {
    try {
      const currentUser = await User.findById(req.user.id);
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      const users = await User.find().select('-password'); // Don't return passwords
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Update logged-in user's profile
// Update logged-in user's profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body; // The fields sent from frontend

    // Update the user in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true } // returns the updated document
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser); // Send updated user back
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



  module.exports = router;
