const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age cannot be more than 150'],
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'hr_manager', 'staff'],
      default: 'staff',
    },
    department: {
      type: String,
      enum: ['Executive', 'Human Resources', 'Finance', 'Operations', 'Technology', 'Marketing', 'Sales'],
      default: 'Technology',
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // models/User.js - Add these fields

requirements: {
  type: String,
  default: ''
},
dueDate: {
  type: Date
},
convertedFromCustomer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Customer'
},
    phone: {
      type: String,
      match: [/^\+?[\d\s-]{10,}$/, 'Please add a valid phone number'],
    },
    profilePicture: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      maxlength: [500, 'About cannot be more than 500 characters'],
      default: '',
    },
    education: [{
      degree: { type: String, required: true },
      institution: { type: String, required: true },
      year: { type: String, required: true },
      description: { type: String, default: '' },
    }],
    experience: [{
      company: { type: String, required: true },
      position: { type: String, required: true },
      startDate: { type: String, required: true },
      endDate: { type: String, default: 'Present' },
      description: { type: String, default: '' },
    }],
    socialMedia: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    hobbies: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say',
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'prefer-not-to-say'],
      default: 'prefer-not-to-say',
    },
    nationality: {
      type: String,
      default: '',
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Add these fields to userSchema
leaveBalance: {
  annual: {
    type: Number,
    default: 20
  },
  sick: {
    type: Number,
    default: 10
  },
  personal: {
    type: Number,
    default: 5
  }
},
    lastLogin: {
      type: Date,
    },
    
  },
  {
    timestamps: true,
  }
);

// ============================================
// Generate Employee ID - FIXED
// ============================================
userSchema.pre('save', async function () {
  if (!this.employeeId) {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-4);
    this.employeeId = `RT-${year}${timestamp}`;
  }
});

// ============================================
// Hash Password - FIXED
// ============================================
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ============================================
// Compare Password
// ============================================
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);