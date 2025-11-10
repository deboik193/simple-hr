// models/Department.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactEmail: String,
  headCount: {
    type: Number,
    default: 0
  },
  leaveSettings: {
    maxConcurrentLeaves: Number,
    requiredCoverage: { type: Number, default: 70 } // Minimum team coverage percentage
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

departmentSchema.pre('save', async function (next) {

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

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);