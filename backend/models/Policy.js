// models/Policy.js
const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  policyId: {
    type: String,
    required: true,
    unique: true
  },
  policyName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Employee Handbook',
      'HR Policy',
      'CEO Policy',
      'Staff Policy',
      'Customer Policy',
      'Shareholder Policy',
      'IT Policy',
      'Security Policy',
      'Finance Policy',
      'Operations Policy',
      'Code of Conduct',
      'Data Privacy',
      'Corporate Governance',
      'Corporate Financial Management',
      'Corporate Rule Book',
      'User/Developer Policy'
    ],
    required: true
  },
  categoryCode: {
    type: String,
    required: true,
    uppercase: true
  },
  appliesTo: {
    type: String,
    enum: [
      'All',
      'Staff',
      'HR Manager',
      'CEO',
      'Admin',
      'Super Admin',
      'Customers',
      'Shareholders',
      'Developers',
      'Corporate'
    ],
    required: true
  },
  appliesToCode: {
    type: String,
    required: true,
    uppercase: true
  },
  approvalAuthority: {
    type: String,
    enum: ['CEO', 'HR Manager', 'Admin', 'Super Admin', 'COO'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Under Review', 'Archived'],
    default: 'Draft'
  },
  // ============================================
  // SIGNATURE CARDS CONFIGURATION (ALL OPTIONAL)
  // ============================================
  signatureCards: [{
    type: {
      type: String,
      enum: ['Approved By', 'Customer'],
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    showDate: {
      type: Boolean,
      default: true
    }
  }],
  customSignatures: [{
    type: {
      type: String,
      enum: ['Approved By', 'Customer'],
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    signature: {
      type: String,
      default: ''
    },
    signedAt: {
      type: Date,
      default: Date.now
    },
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
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
  updatedByName: {
    type: String
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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
  }]
}, {
  timestamps: true
});

// ============================================
// Category Code Mapping (3 Letters)
// ============================================
const CATEGORY_CODE_MAP = {
  'Employee Handbook': 'EHB',
  'HR Policy': 'HRP',
  'CEO Policy': 'CEP',
  'Staff Policy': 'STP',
  'Customer Policy': 'CUP',
  'Shareholder Policy': 'SHP',
  'IT Policy': 'ITP',
  'Security Policy': 'SEP',
  'Finance Policy': 'FIP',
  'Operations Policy': 'OPP',
  'Code of Conduct': 'COC',
  'Data Privacy': 'DAP',
  'Corporate Governance': 'COG',
  'Corporate Financial Management': 'CFM',
  'Corporate Rule Book': 'CRB',
  'User/Developer Policy': 'UDP'
};

// ============================================
// Applies To Code Mapping (1 Letter)
// ============================================
const APPLIES_TO_CODE_MAP = {
  'All': 'A',
  'Staff': 'S',
  'HR Manager': 'H',
  'CEO': 'C',
  'Admin': 'A',
  'Super Admin': 'SA',
  'Customers': 'CU',
  'Shareholders': 'SH',
  'Developers': 'D',
  'Corporate': 'CO'
};

// ============================================
// Static method to get category code
// ============================================
policySchema.statics.getCategoryCode = function(category) {
  return CATEGORY_CODE_MAP[category] || 'OTH';
};

// ============================================
// Static method to get applies to code
// ============================================
policySchema.statics.getAppliesToCode = function(appliesTo) {
  return APPLIES_TO_CODE_MAP[appliesTo] || 'A';
};

// ============================================
// Generate Policy ID with sequence
// ============================================
policySchema.statics.generatePolicyId = function(appliesTo, category, sequence = 1) {
  const categoryCode = this.getCategoryCode(category);
  const appliesToCode = this.getAppliesToCode(appliesTo);
  const sequenceStr = String(sequence).padStart(2, '0');
  return `RT-${categoryCode}-${appliesToCode}${sequenceStr}`;
};

// ============================================
// Get next available policy ID
// ============================================
policySchema.statics.getNextPolicyId = async function(appliesTo, category) {
  const categoryCode = this.getCategoryCode(category);
  const appliesToCode = this.getAppliesToCode(appliesTo);
  
  const prefix = `RT-${categoryCode}-${appliesToCode}`;
  const existingPolicies = await this.find({
    policyId: { $regex: `^${prefix}` }
  }).sort({ policyId: -1 });
  
  if (existingPolicies.length === 0) {
    return this.generatePolicyId(appliesTo, category, 1);
  }
  
  const lastId = existingPolicies[0].policyId;
  const sequence = parseInt(lastId.slice(-2)) + 1;
  return this.generatePolicyId(appliesTo, category, sequence);
};

// ============================================
// Get active employees by role
// ============================================
policySchema.statics.getActiveEmployeesByRole = async function(role) {
  const User = mongoose.model('User');
  const roleMap = {
    'CEO': 'ceo',
    'HR Manager': 'hr_manager',
    'Admin': 'admin',
    'Super Admin': 'super_admin',
    'COO': 'coo'
  };
  
  const dbRole = roleMap[role];
  if (!dbRole) return [];
  
  return await User.find({ role: dbRole, isActive: true })
    .select('name email role profilePicture');
};

// ============================================
// Indexes
// ============================================
policySchema.index({ policyId: 1 }, { unique: true });
policySchema.index({ policyName: 1 });
policySchema.index({ category: 1 });
policySchema.index({ status: 1 });
policySchema.index({ appliesTo: 1 });

module.exports = mongoose.model('Policy', policySchema);