const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust the path to your User model

// POST route for user login
router.post('/login', async (req, res) => {
  const { email, password } = req.query;

  try {
    // Check if the user exists
    let user = await User.findOne({ email });
   
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate password (assuming password is hashed)
    const isMatch = await bcrypt.compare(password, user.password);


    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Respond with success message
    res.status(200).json({ message: 'Login successful' });
    // return res.status(200).json({
    //   email: User.email,
    // });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
