// models/PasswordManager.js
const mongoose = require('mongoose');

const passwordManagerSchema = new mongoose.Schema({
  // Website Information
  websiteName: {
    type: String,
    required: true,
    trim: true
  },
  websiteUrl: {
    type: String,
    required: true,
    trim: true
  },
  websiteCategory: {
    type: String,
    enum: ['E-commerce', 'Blog', 'Corporate', 'Portfolio', 'Education', 'Healthcare', 'Finance', 'Social Media', 'Other'],
    default: 'Other'
  },
  
  // Login Credentials
  username: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  
  // Password Management
  passwordStrength: {
    type: String,
    enum: ['Weak', 'Medium', 'Strong', 'Very Strong'],
    default: 'Medium'
  },
  lastChanged: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  
  // User Management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String,
    required: true
  },
  createdByRole: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToName: {
    type: String
  },
  
  // Access Control
  accessLevel: {
    type: String,
    enum: ['Owner', 'Admin', 'Editor', 'Viewer'],
    default: 'Owner'
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    userRole: String,
    accessLevel: {
      type: String,
      enum: ['Admin', 'Editor', 'Viewer'],
      default: 'Viewer'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Activity Log
  activityLog: [{
    action: {
      type: String,
      enum: ['Created', 'Updated', 'Viewed', 'Password Changed', 'Shared', 'Revoked Access']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    userRole: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  
  // Security
  isActive: {
    type: Boolean,
    default: true
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  
  // Metadata
  tags: [{
    type: String
  }],
  lastViewed: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate unique ID for password entry
passwordManagerSchema.pre('save', function(next) {
  if (!this.password) {
    // Auto-generate a secure password if not provided
    const generatePassword = () => {
      const length = 16;
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
      let password = "";
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return password;
    };
    this.password = generatePassword();
  }
  next();
});

// Calculate password strength
passwordManagerSchema.methods.calculateStrength = function() {
  const password = this.password;
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score >= 5) return 'Very Strong';
  if (score >= 4) return 'Strong';
  if (score >= 3) return 'Medium';
  return 'Weak';
};

// Indexes
passwordManagerSchema.index({ websiteName: 1 });
passwordManagerSchema.index({ username: 1 });
passwordManagerSchema.index({ createdBy: 1 });
passwordManagerSchema.index({ assignedTo: 1 });
passwordManagerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PasswordManager', passwordManagerSchema);