const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '🌟 Welcome to Your New Journey!  Congratulations on becoming a part of **Riseup-Tech Software Company**. This is the beginning of an exciting journey filled with opportunities to learn, grow, and make a meaningful impact. We believe in your potential and look forward to celebrating your achievements together.Welcome aboard, and we wish you every success in your career with Riseup-Tech!',
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.matchPassword(password);
    
    if (!isPasswordMatch) {
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
    console.error('Login error:', error);
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