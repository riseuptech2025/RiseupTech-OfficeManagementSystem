// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
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
  
  // ============================================
  // NEW: Record Keeping Fields
  // ============================================
  requirements: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date
  },
  projectType: {
    type: String,
    enum: ['Website Development', 'Mobile App', 'Software Development', 'Design', 'Consulting', 'Maintenance', 'Other'],
    default: 'Other'
  },
  projectStatus: {
    type: String,
    enum: ['New', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToName: {
    type: String
  },
  followUpDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  communicationLog: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'WhatsApp', 'Other']
    },
    subject: String,
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByName: String,
    nextAction: String,
    nextActionDate: Date
  }],
  
  // Financial
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
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isConverted: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
customerSchema.index({ phone: 1 }, { unique: true });
customerSchema.index({ name: 1 });
customerSchema.index({ projectStatus: 1 });
customerSchema.index({ dueDate: 1 });
customerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Customer', customerSchema);