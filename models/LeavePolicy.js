// models/LeavePolicy.js
const { LEAVETYPE, EMPLOYEETYPE, ACCRUAL, ROLE } = require('@/constant/constant');
const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema({
  policyName: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    enum: LEAVETYPE,
    required: true
  },
  eligibility: {
    employmentTypes: [{
      type: String,
      enum: EMPLOYEETYPE
    }],
    minServiceDays: { type: Number, default: 0 }
  },
  accrual: {
    type: {
      type: String,
      enum: ACCRUAL,
      default: 'annual'
    },
    rate: Number,
    maxBalance: Number
  },
  carryOver: {
    enabled: { type: Boolean, default: false },
    maxDays: Number,
    expiryDays: Number
  },
  approvalWorkflow: {
    requireReliefOfficer: { type: Boolean, default: true },
    approvalLevels: [{
      type: String,
      enum: ROLE
    }]
  },
  restrictions: {
    blackoutDates: [Date],
    minNoticeDays: Number,
    maxConsecutiveDays: Number,
    allowHalfDays: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


leavePolicySchema.pre('save', async function (next) {

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

module.exports = mongoose.models.LeavePolicy || mongoose.model('LeavePolicy', leavePolicySchema);