// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
    // REMOVED: unique: true (handled by index below)
  },
  email: {
    type: String
  },
  address: {
    type: String
  },
  company: {
    type: String
  },
  panNumber: {
    type: String
  },
  notes: {
    type: String
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalAmountSpent: {
    type: Number,
    default: 0
  },
  lastPurchaseDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ============================================
// Indexes
// ============================================
customerSchema.index({ phone: 1 }, { unique: true });
customerSchema.index({ name: 1 });
customerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Customer', customerSchema);