// models/LeaveRequest.js
const { LEAVETYPE, STATUS, APPROVALHISTORY, APPROVALLEVEL } = require('@/constant/constant');
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
    enum: STATUS,
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
    enum: STATUS,
    default: 'pending'
  },
  additionalFile: String,

  // Multi-level Approval Tracking
  approvalHistory: [{
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: APPROVALLEVEL,
      required: true
    },
    action: {
      type: String,
      enum: APPROVALHISTORY
    },
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeavePolicy'
  },

  // Handover information
  handoverNotes: String,
  urgentContact: String,
}, {
  timestamps: true
});

// Indexes for performance
leaveRequestSchema.index({ employeeId: 1 });
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

module.exports = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);