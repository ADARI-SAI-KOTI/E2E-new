const express = require('express');
const Complaint = require('../models/Complaint');
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaint,
  updateComplaintStatus,
  addComment,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public track-by-ID route handler (define before using in routes)
const trackComplaintPublic = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    // Normalize dates as per frontend expectations
    const normalizedComplaint = {
      ...complaint.toObject(),
      createdAt: complaint.createdAt ? new Date(complaint.createdAt) : null,
      updatedAt: complaint.updatedAt ? new Date(complaint.updatedAt) : null,
    };
    res.json({ data: normalizedComplaint });
  } catch (error) {
    console.error("Error tracking complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Protected routes
router.get('/', protect, getAllComplaints);
router.post('/', protect, createComplaint);

// Static routes (must come before dynamic /:id routes)
router.get('/user/my-complaints', protect, getMyComplaints);

// Add public GET /:id route for tracking (matches frontend /complaints/:id)
router.get('/:id', trackComplaintPublic);  // Public, no protect middleware

// Dynamic routes (specific operations before generic :id)
router.put('/:id/status', protect, authorize('admin', 'department'), updateComplaintStatus);
router.post('/:id/comments', protect, addComment);
router.put('/:id', protect, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

// Keep the /track/:id route as an alias if needed, or remove if not required
router.get('/track/:id', trackComplaintPublic);

module.exports = router;