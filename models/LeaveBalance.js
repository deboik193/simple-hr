// models/LeaveBalance.js
const { LEAVETYPE } = require('@/constant/constant');
const mongoose = require('mongoose');

// Create a dynamic object based on LEAVETYPE
const leaveBalanceSchemaFields = LEAVETYPE.reduce((acc, type) => {
  acc[type] = { type: Number, default: 0 };
  return acc;
}, {});

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
  fiscalYear: {
    type: Number,
    required: true
  },
  lastAccruedMonth: Number,
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