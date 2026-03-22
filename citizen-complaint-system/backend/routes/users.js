const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getCitizenProfile, getCitizenProfileWithStats, updateProfile } = require('../controllers/userController');

const router = express.Router();

// Get citizen profile with complaint stats (Protected route)
router.get('/profile/stats', protect, getCitizenProfile);

// Get citizen profile with stats (alternative endpoint)
router.get('/profile/with-stats', protect, getCitizenProfileWithStats);

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update citizen profile (Protected route)
router.put('/profile/update', protect, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { name, email, phone, address, city, state, pincode } = req.body;

    // Validate at least one field is provided
    if (!name && !email && !phone && !address && !city && !state && !pincode) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
