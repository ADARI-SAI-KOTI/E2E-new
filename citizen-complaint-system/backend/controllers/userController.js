const mongoose = require('mongoose');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name email phone');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city } = req.body;

    let user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Deactivate user (admin only)
exports.deactivateUser = async (req, res) => {
  try {
    const identifier = req.params.id;

    // Allow deactivation by ID or by email
    const user = identifier.includes('@')
      ? await User.findOne({ email: identifier })
      : await User.findById(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Activate user (admin only)
exports.activateUser = async (req, res) => {
  try {
    const identifier = req.params.id;

    // Allow activation by ID or by email
    const user = identifier.includes('@')
      ? await User.findOne({ email: identifier })
      : await User.findById(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get profile of a citizen
exports.getCitizenProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const counts = await Complaint.aggregate([
      { $match: { citizen: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = { total: 0, pending: 0, resolved: 0, inProgress: 0, closed: 0 };
    counts.forEach((item) => {
      stats.total += item.count;
      if (item._id === 'pending') stats.pending = item.count;
      else if (item._id === 'resolved' || item._id === 'completed') stats.resolved = item.count;
      else if (item._id === 'in-progress' || item._id === 'inProgress') stats.inProgress = item.count;
      else if (item._id === 'closed') stats.closed = item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        complaintStats: stats,
      },
    });
  } catch (error) {
    console.error('getCitizenProfile error', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
};

// If you want a separate export, re-use same logic:
exports.getCitizenProfileWithStats = async (req, res) => {
  try {
    // Same as getCitizenProfile, keep single source of truth
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const counts = await Complaint.aggregate([
      { $match: { citizen: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats = { total: 0, pending: 0, resolved: 0, inProgress: 0, closed: 0 };
    counts.forEach((item) => {
      stats.total += item.count;
      if (item._id === 'pending') stats.pending = item.count;
      else if (item._id === 'resolved' || item._id === 'completed') stats.resolved = item.count;
      else if (item._id === 'in-progress' || item._id === 'inProgress') stats.inProgress = item.count;
      else if (item._id === 'closed') stats.closed = item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        complaintStats: stats,
      },
    });
  } catch (error) {
    console.error('getCitizenProfileWithStats error', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile with stats',
    });
  }
};


