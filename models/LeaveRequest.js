// models/LeaveRequest.js
const { LEAVETYPE } = require('@/constant/constant');
const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: LEAVETYPE,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'draft',
      'pending-relief',
      'pending-manager',
      'pending-hr',
      'approved',
      'rejected',
      'cancelled',
      'revoked'
    ],
    default: 'draft'
  },
  // Relief Officer System
  reliefOfficerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reliefStatus: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending'
  },
  
  reliefNotes: String,

  // Multi-level Approval Tracking
  approvalHistory: [{
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    action: {
      type: String,
      enum: ['submitted', 'accepted-relief', 'declined-relief', 'approved', 'rejected', 'recalled']
    },
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Handover information
  handoverNotes: String,
  urgentContact: String,

  // System fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
leaveRequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
leaveRequestSchema.index({ employeeId: 1, createdAt: -1 });
leaveRequestSchema.index({ reliefOfficerId: 1, status: 1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });


leaveRequestSchema.pre('save', async function (next) {

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

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);