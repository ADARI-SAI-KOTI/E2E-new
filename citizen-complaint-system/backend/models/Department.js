const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide department name'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide department email'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide department phone']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  address: String,
  categories: [String],
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for performance
departmentSchema.index({ categories: 1 });
departmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Department', departmentSchema);
