const Complaint = require('../models/Complaint');
const Department = require('../models/Department');

// Create complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, location, latitude, longitude, imageUrl, attachments } = req.body;

    // Normalize category and validate required fields
    const normalizedCategory = String(category || '').trim().toLowerCase();

    if (!title || !description || !normalizedCategory || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Find the appropriate department based on category
    const department = await Department.findOne({
      categories: normalizedCategory,
      isActive: true
    });

    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'No department available for this category'
      });
    }

    const complaint = new Complaint({
      title,
      description,
      category: normalizedCategory,
      priority,
      location,
      latitude,
      longitude,
      attachments: Array.isArray(attachments)
        ? attachments.filter(Boolean)
        : (typeof imageUrl === 'string' && imageUrl.trim() ? [imageUrl.trim()] : []),
      citizen: req.user._id,
      department: department._id, // Auto-assign to department
      status: 'pending' // Status remains pending until department accepts/rejects
    });

    await complaint.save();
    await complaint.populate('citizen');
    await complaint.populate('department', 'name');

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Filter by department for department users
    if (req.user.role === 'department') {
      // Include complaints already assigned to this department
      // Additionally, include any existing complaints that are not yet assigned but belong to this department's categories
      const dept = await Department.findById(req.user.department).lean();
      if (dept) {
        filter.$or = [
          { department: req.user.department },
          { department: { $exists: false }, category: { $in: dept.categories } }
        ];
      } else {
        filter.department = req.user.department;
      }
    }

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { citizen: req.user._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Public route for tracking a complaint by ID (no authentication required)
exports.trackComplaintPublic = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('department', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Return complaint details for public tracking
    res.status(200).json({
      success: true,
      data: {
        _id: complaint._id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        location: complaint.location,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        citizen: complaint.citizen,
        department: complaint.department,
        comments: complaint.comments || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};

// Get single complaint
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('department', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // For public access (no authentication), allow viewing complaint details
    // If user is authenticated, additional checks can be added here
    if (req.user) {
      // User is authenticated - can be citizen, admin, or department
      if (req.user.role === 'citizen' && complaint.citizen._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this complaint'
        });
      }
    }
    // If no req.user, it's public access - allow viewing

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
};

// Update complaint
exports.updateComplaint = async (req, res) => {
  try {
    const { title, description, priority, location } = req.body;

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check ownership
    if (complaint.citizen.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this complaint'
      });
    }

    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (priority) complaint.priority = priority;
    if (location) complaint.location = location;

    complaint.updatedAt = Date.now();
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check permissions
    if (req.user.role === 'department') {
      // Department can only update complaints assigned to their department.
      // If the complaint is missing a department, allow handling based on matching categories.
      let isAuthorized = false;
      if (complaint.department) {
        isAuthorized = complaint.department.toString() === req.user.department.toString();
      } else {
        const dept = await Department.findById(req.user.department).lean();
        if (dept && Array.isArray(dept.categories) && dept.categories.includes(complaint.category)) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this complaint'
        });
      }

      // Department can only accept/reject pending complaints
      if (complaint.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Can only accept or reject pending complaints'
        });
      }

      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Department can only accept or reject complaints'
        });
      }
    } else if (req.user.role === 'admin') {
      // Admin can view complaints but should not accept/reject them.
      if (['accepted', 'rejected'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'Only departments can accept or reject complaints'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update complaint status'
      });
    }

    complaint.status = status;
    if (resolution) complaint.resolution = resolution;
    if (status === 'resolved') {
      complaint.resolutionDate = Date.now();
    }

    // Assign to department user when department accepts
    if (status === 'accepted' && req.user.role === 'department') {
      complaint.assignedTo = req.user._id;
    }

    complaint.updatedAt = Date.now();

    await complaint.save();
    await complaint.populate('department', 'name');
    await complaint.populate('assignedTo', 'name');

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add comment to complaint
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment text'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.comments.push({
      user: req.user._id,
      text
    });

    await complaint.save();
    await complaint.populate('comments.user', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: complaint.comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check ownership
    if (complaint.citizen.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this complaint'
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
