// models/Expenditure.js
const mongoose = require('mongoose');

const expenditureSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'Office Rent',
      'Utilities',
      'Salaries',
      'Equipment',
      'Software Licenses',
      'Marketing',
      'Travel',
      'Food & Beverage',
      'Stationery',
      'Maintenance',
      'Insurance',
      'Taxes',
      'Training',
      'Miscellaneous'
    ],
    required: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['NPR', 'USD', 'EUR', 'GBP', 'INR'],
    default: 'NPR'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Partial', 'Pending', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'eSewa', 'Khalti', 'FonePay'],
    default: 'Cash'
  },
  paymentReference: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  vendorName: {
    type: String,
    required: true
  },
  vendorPhone: {
    type: String
  },
  vendorEmail: {
    type: String
  },
  vendorAddress: {
    type: String
  },
  panNumber: {
    type: String
  },
  invoiceNumber: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedByName: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Paid', 'Cancelled'],
    default: 'Draft'
  },
  attachments: [{
    name: String,
    url: String,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: {
    type: String,
    maxlength: 1000
  },
  auditLog: [{
    action: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ============================================
// NO PRE-SAVE MIDDLEWARE - Handle in controller
// ============================================

// ============================================
// Indexes
// ============================================
expenditureSchema.index({ receiptNumber: 1 }, { unique: true });
expenditureSchema.index({ category: 1 });
expenditureSchema.index({ status: 1 });
expenditureSchema.index({ paymentStatus: 1 });
expenditureSchema.index({ transactionDate: -1 });

module.exports = mongoose.model('Expenditure', expenditureSchema);