const express = require('express');
const {
  createDepartment,
  getAllDepartments,
  getDepartment,
  updateDepartment,
  addStaffToDepartment,
  removeStaffFromDepartment,
  deactivateDepartment
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllDepartments);
router.get('/:id', getDepartment);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createDepartment);
router.put('/:id', protect, authorize('admin'), updateDepartment);
router.post('/:id/staff', protect, authorize('admin'), addStaffToDepartment);
router.delete('/:id/staff', protect, authorize('admin'), removeStaffFromDepartment);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateDepartment);

module.exports = router;
