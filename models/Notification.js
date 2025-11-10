// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'leave-submitted',
      'relief-requested',
      'relief-accepted',
      'relief-declined',
      'manager-approval',
      'hr-approval',
      'leave-approved',
      'leave-rejected',
      'leave-cancelled',
      'balance-update'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveRequest'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  actionUrl: String, // URL for the user to take action
  expiresAt: Date
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index


notificationSchema.pre('save', async function (next) {

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

module.exports = mongoose.model('Notification', notificationSchema);