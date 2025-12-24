// models/LeaveBalance.js
const { LEAVETYPE } = require('@/constant/constant');
const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: LEAVETYPE,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  accrualRate: Number,
  maxAccrual: Number,
  carryOverLimit: Number,
  carryOverUsed: Number,
  totalUsed: { type: Number, default: 0 }, // Total leave taken this year
  fiscalYear: {
    type: Number,
    required: true
  },
  lastAccruedMonth: Number,
  lastUpdated: Date,
}, {
  timestamps: true
});

// Compound index
leaveBalanceSchema.index({ userId: 1, leaveType: 1, fiscalYear: 1 }, { unique: true });


leaveBalanceSchema.pre('save', async function (next) {

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

module.exports = mongoose.models.LeaveBalance || mongoose.model('LeaveBalance', leaveBalanceSchema);