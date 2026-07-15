// models/Salary.js
const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeRole: {
    type: String,
    required: true
  },
  employeeDepartment: {
    type: String
  },
  joinDate: {
    type: Date,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  bonus: {
    type: Number,
    default: 0,
    min: 0
  },
  allowance: {
    type: Number,
    default: 0,
    min: 0
  },
  deductions: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSalary: {
    type: Number,
    required: true,
    min: 0
  },
  
  // ============================================
  // ADVANCE SALARY FEATURES
  // ============================================
  advanceSalary: {
    type: Number,
    default: 0,
    min: 0
  },
  advanceInterest: {
    type: Number,
    default: 0,
    min: 0
  },
  advanceInterestRate: {
    type: Number,
    default: 3, // 3% interest
    min: 0,
    max: 100
  },
  advanceTakenDate: {
    type: Date
  },
  advanceApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  advanceApprovedByName: {
    type: String
  },
  advanceStatus: {
    type: String,
    enum: ['None', 'Pending', 'Approved', 'Paid', 'Cleared'],
    default: 'None'
  },
  advanceDeductionPerMonth: {
    type: Number,
    default: 0
  },
  advanceRemaining: {
    type: Number,
    default: 0
  },
  advancePaidHistory: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'eSewa', 'Khalti', 'Cheque']
    },
    reference: String,
    notes: String
  }],
  
  // Payment Tracking
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
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending'
  },
  
  // Prorated Salary Fields
  isProrated: {
    type: Boolean,
    default: false
  },
  proratedDays: {
    type: Number,
    default: 0
  },
  workingDaysInMonth: {
    type: Number,
    default: 30
  },
  
  // Period
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  
  // Payments History
  paymentHistory: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'eSewa', 'Khalti', 'Cheque'],
      default: 'Cash'
    },
    reference: String,
    date: {
      type: Date,
      default: Date.now
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paidByName: String,
    notes: String
  }],
  
  // Metadata
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
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
salarySchema.index({ employee: 1, paymentStatus: 1 });
salarySchema.index({ month: 1, year: 1 });
salarySchema.index({ advanceStatus: 1 });

module.exports = mongoose.model('Salary', salarySchema);