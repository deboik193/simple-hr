// models/InitialLeaveBalance.js
const { LEAVETYPE } = require('@/constant/constant');
const mongoose = require('mongoose');

const initialLeaveBalanceSchema = new mongoose.Schema({
  // Dynamic leave balance fields
  ...LEAVETYPE.reduce((acc, type) => {
    acc[type] = { type: Number, default: 0 };
    return acc;
  }, {}),

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
initialLeaveBalanceSchema.index({ isActive: 1 });

initialLeaveBalanceSchema.pre('save', async function (next) {

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

module.exports = mongoose.models.InitialLeaveBalance || mongoose.model('InitialLeaveBalance', initialLeaveBalanceSchema);