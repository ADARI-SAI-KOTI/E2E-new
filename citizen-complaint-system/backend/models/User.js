const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number']
  },
  address: {
    type: String,
    required: [true, 'Please provide an address']
  },
  city: {
    type: String,
    required: false,
    trim: true
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'department'],
    default: 'citizen'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() {
      return this.role === 'department';
    }
  },
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
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  // If password is already bcrypt-hashed, compare normally.
  // If it's plain-text (e.g., seeded with insertMany), compare directly and upgrade.
  const isBcryptHash = typeof this.password === 'string' && this.password.startsWith('$2') && this.password.length >= 50;

  if (isBcryptHash) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Legacy plain-text password stored in DB (seeded via insertMany).
  const isMatch = enteredPassword === this.password;
  if (isMatch) {
    // Upgrade to hashed password on first successful login
    this.password = enteredPassword;
    await this.save();
  }

  return isMatch;
};

module.exports = mongoose.model('User', userSchema);
