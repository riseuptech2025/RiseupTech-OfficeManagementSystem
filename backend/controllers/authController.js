// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { 
      email, 
      passwordLength: password?.length,
      timestamp: new Date().toISOString()
    });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // ============================================
    // Check if user exists with +password field
    // ============================================
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log('✅ User found:', { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User inactive:', email);
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.',
      });
    }

    // ============================================
    // Check password using bcrypt directly
    // ============================================
    console.log('🔐 Comparing password...');
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    
    console.log('🔐 Password match result:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { 
      lastLogin: new Date() 
    });

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Login successful for:', email);

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  loginUser,
  getMe,
};