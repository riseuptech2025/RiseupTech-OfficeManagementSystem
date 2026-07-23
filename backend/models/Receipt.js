// models/Receipt.js
const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  // Auto-generated fields
  receiptNumber: {
    type: String,
    required: true
  },
  invoiceNumber: {
    type: String,
    // sparse: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },originalReceiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  },
  isPartialPayment: {
    type: Boolean,
    default: false
  },
  partialPayments: [{
    receiptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Receipt'
    },
    amount: Number,
    date: Date,
    receiptNumber: String
  }],
  issueTime: {
    type: String
  },
  dateStr: {
    type: String
  },
  timeStr: {
    type: String
  },
  
  // Company details
  companyName: {
    type: String,
    default: 'Riseup-Tech Software Company'
  },
  companyLogo: {
    type: String,
    default: '/logo.png'
  },
  companyAddress: {
    type: String,
    default: 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal'
  },
  companyPhone: {
    type: String,
    default: '9827399860'
  },
  companyEmail: {
    type: String,
    default: 'mail@riseuptech.com.np'
  },
  companyWebsite: {
    type: String,
    default: 'riseuptech.com.np'
  },
  companyPan: {
    type: String,
    default: '152445267'
  },
  receiptTitle: {
    type: String,
    default: 'PAYMENT RECEIPT'
  },
  
  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  recipientName: {
    type: String,
    required: true
  },
  recipientPhone: {
    type: String,
    required: true
  },
  recipientEmail: {
    type: String
  },
  recipientAddress: {
    type: String
  },
  
  // Services / Items
  items: [{
    description: {
      type: String,
      required: true
    },
    descriptionDetail: {
      type: String
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  
  // Billing Summary
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 13,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountInWords: {
    type: String
  },
  
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
    enum: ['Paid', 'Partial', 'Pending', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'eSewa', 'Khalti', 'Bank Transfer', 'FonePay', 'Credit/Debit Card'],
    default: 'Cash'
  },
  paymentReference: {
    type: String
  },
  bankName: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  
  // Payment History
  paymentHistory: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      enum: ['Cash', 'eSewa', 'Khalti', 'Bank Transfer', 'FonePay', 'Credit/Debit Card']
    },
    reference: String,
    bankName: String,
    date: {
      type: Date,
      default: Date.now
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    receivedByName: String,
    notes: String
  }],
  
  // Additional Information
  remarks: {
    type: String,
    maxlength: 1000,
    default: 'Thank you for choosing Riseup-Tech Software Company. We appreciate your business and look forward to serving you again.'
  },
  
  // Signatures
  customerSignature: {
    type: String
  },
  authorizedSignature: {
    type: String
  },
  companyStamp: {
    type: String
  },
  
  // Metadata
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedByName: {
    type: String,
    required: true
  },
  generatedByRole: {
    type: String,
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  issuedByName: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'issued', 'paid', 'cancelled'],
    default: 'issued'
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['Salary', 'Bonus', 'Reimbursement', 'Invoice', 'Payment', 'Other'],
    default: 'Invoice'
  },
  
  // Tracking
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  editHistory: [{
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedByName: {
      type: String
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    changes: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  
  // Audit Log
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
  
  termsAndConditions: {
    type: String,
    default: 'Thank you for choosing Riseup-Tech Software Company. We appreciate your business.'
  }
}, {
  timestamps: true
});

// ============================================
// NO PRE-SAVE MIDDLEWARE - Everything handled in controller
// ============================================

// ============================================
// Indexes - Remove duplicates
// ============================================
receiptSchema.index({ receiptNumber: 1 }, { unique: true });
receiptSchema.index({ invoiceNumber: 1 }, { unique: true, sparse: true });
receiptSchema.index({ generatedBy: 1, createdAt: -1 });
receiptSchema.index({ recipientEmail: 1, createdAt: -1 });
receiptSchema.index({ status: 1, createdAt: -1 });
receiptSchema.index({ customerId: 1 });

module.exports = mongoose.model('Receipt', receiptSchema);