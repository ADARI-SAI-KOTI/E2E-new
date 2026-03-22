const Department = require('../models/Department');
const User = require('../models/User');

// Create department (admin only)
exports.createDepartment = async (req, res) => {
  try {
    const { name, email, phone, description, address, categories } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if department already exists
    let department = await Department.findOne({ email });
    if (department) {
      return res.status(400).json({
        success: false,
        message: 'Department with this email already exists'
      });
    }

    department = new Department({
      name,
      email,
      phone,
      description,
      address,
      categories: categories || []
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const departments = await Department.find({ isActive: true })
      .populate('head', 'name email phone')
      .populate('staff', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Department.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      count: departments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single department
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email phone address')
      .populate('staff', 'name email phone');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update department (admin only)
exports.updateDepartment = async (req, res) => {
  try {
    const { name, email, phone, description, address, categories } = req.body;

    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (name) department.name = name;
    if (email) department.email = email;
    if (phone) department.phone = phone;
    if (description) department.description = description;
    if (address) department.address = address;
    if (categories) department.categories = categories;

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add staff to department (admin only)
exports.addStaffToDepartment = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId'
      });
    }

    const department = await Department.findById(req.params.id);
    const user = await User.findById(userId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (department.staff.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already staff in this department'
      });
    }

    department.staff.push(userId);
    user.department = department._id;
    user.role = 'department';

    await department.save();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Staff added to department successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove staff from department (admin only)
exports.removeStaffFromDepartment = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId'
      });
    }

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    department.staff = department.staff.filter(staff => staff.toString() !== userId);
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Staff removed from department successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Deactivate department (admin only)
exports.deactivateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    department.isActive = false;
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
