const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const departmentStats = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsers,
        roleStats,
        departmentStats,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get recent users
// @route   GET /api/dashboard/recent-users
// @access  Private
const getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-password');

    res.status(200).json({
      success: true,
      data: recentUsers,
    });
  } catch (error) {
    console.error('Recent users error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user activity stats
// @route   GET /api/dashboard/activity
// @access  Private
const getActivityStats = async (req, res) => {
  try {
    // Get users created in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get users created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        weeklyUsers,
        todayUsers,
      },
    });
  } catch (error) {
    console.error('Activity stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentUsers,
  getActivityStats,
};