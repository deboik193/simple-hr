// models/User.js
const { LEAVETYPE, ROLE, EMPLOYEETYPE } = require('@/constant/constant');
const mongoose = require('mongoose');

// Create a dynamic object based on LEAVETYPE
const leaveBalanceSchemaFields = LEAVETYPE.reduce((acc, type) => {
  acc[type] = { type: Number, default: 0 };
  return acc;
}, {});

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ROLE,
    default: 'employee'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  position: String,
  // Password Reset
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teamLeadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employmentType: {
    type: String,
    enum: EMPLOYEETYPE,
    default: 'full-time'
  },
  joinDate: {
    type: Date,
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  levels: {
    type: String,
  },
  leaveBalance: leaveBalanceSchemaFields,
  isActive: {
    type: Boolean,
    default: true
  },
  personalInfo: {
    dateOfBirth: {
      type: Date,
      index: true // Add index for birthday queries
    },
    phoneNumber: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    autoRelief: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ department: 1, isActive: 1 });
userSchema.index({ managerId: 1 });
userSchema.index({ 'personalInfo.dateOfBirth': 1 });
userSchema.index({ isActive: 1, 'preferences.notifications': 1 });

userSchema.pre('save', async function (next) {

  const doc = this;
  const keys = Object.keys(doc._doc);
  keys.forEach(key => {
    if (key !== 'password') {
      const value = doc[key];
      if (typeof value === 'string') {
        doc[key] = value.trim().toLowerCase();
      }
    }
  });

  next();
})

// Add method to check birthday
// Fixed birthday check method
userSchema.methods.isBirthdayThisWeek = function () {
  if (!this.personalInfo?.dateOfBirth) return false;

  const now = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  const currentYear = now.getFullYear();

  // Create birthday for current year
  const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

  // If birthday has already passed this year, check next year
  const nextBirthday = birthdayThisYear < now
    ? new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate())
    : birthdayThisYear;

  // Calculate days until next birthday
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.ceil((nextBirthday - now) / msPerDay);

  return diffDays <= 7;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);