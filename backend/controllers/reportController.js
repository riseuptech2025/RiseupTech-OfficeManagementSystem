const Report = require('../models/Report');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Helper function to determine report routing
const getReportRecipients = async (reporterRole, reporterId) => {
  const allUsers = await User.find({ isActive: true }).select('_id role name email');
  
  // Remove reporter from list
  const others = allUsers.filter(u => u._id.toString() !== reporterId.toString());
  
  if (reporterRole === 'staff') {
    // Staff reports to HR Manager, if none exists or inactive, route to admin
    const hrManagers = others.filter(u => u.role === 'hr_manager');
    if (hrManagers.length > 0) {
      return hrManagers.map(u => u._id);
    }
    // If no HR Manager, route to admins
    const admins = others.filter(u => ['admin', 'coo', 'accountant'].includes(u.role));
    return admins.map(u => u._id);
  } else if (reporterRole === 'hr_manager') {
    // HR Manager reports to Admin
    const admins = others.filter(u => ['admin', 'coo', 'accountant'].includes(u.role));
    return admins.map(u => u._id);
  } else if (['admin', 'coo', 'accountant'].includes(reporterRole)) {
    // Admin reports to Super Admin
    const superAdmins = others.filter(u => ['super_admin', 'ceo', 'founder'].includes(u.role));
    return superAdmins.map(u => u._id);
  }
  
  return [];
};

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { subject, description, category, urgency, isAnonymous, attachments } = req.body;

    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, description and category'
      });
    }

    // Get recipients
    const recipients = await getReportRecipients(req.user.role, req.user.id);

    const reportData = {
      reporter: req.user.id,
      reporterName: req.user.name,
      reporterRole: req.user.role,
      subject,
      description,
      category,
      urgency: urgency || 'medium',
      isAnonymous: isAnonymous || false,
      attachments: attachments || [],
      status: 'submitted'
    };

    // If there are recipients, assign to first one
    if (recipients.length > 0) {
      reportData.assignedTo = recipients[0];
      const assignedUser = await User.findById(recipients[0]);
      if (assignedUser) {
        reportData.assignedToName = assignedUser.name;
        reportData.assignedToRole = assignedUser.role;
      }
    }

    const report = await Report.create(reportData);

    if (report.assignedTo) {
      await notificationService.notifyReportSubmission(report, report.assignedTo);
    }

    // Add audit log
    report.auditLog.push({
      action: 'created',
      user: req.user.id,
      userName: req.user.name,
      details: `Report "${subject}" created`
    });
    await report.save();

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
  try {
    const { status, category, urgency, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    // Filter based on user role
    if (['staff', 'hr_manager'].includes(req.user.role)) {
      // Staff and HR Managers see their own reports
      query.reporter = req.user.id;
    } else if (['admin', 'coo', 'accountant'].includes(req.user.role)) {
      // Admins see reports assigned to them or reports from staff/HR
      query.$or = [
        { assignedTo: req.user.id },
        { reporter: req.user.id }
      ];
    } else if (['super_admin', 'ceo', 'founder'].includes(req.user.role)) {
      // Super Admins see all reports
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reporter', 'name email role profilePicture')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role')
      .populate('comments.user', 'name email role profilePicture');

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email role profilePicture department')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role')
      .populate('comments.user', 'name email role profilePicture');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    const isReporter = report.reporter._id.toString() === req.user.id;
    const isAssigned = report.assignedTo && report.assignedTo._id.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isReporter && !isAssigned && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private
const updateReportStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, assignedTo } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    const isAssigned = report.assignedTo && report.assignedTo.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);
    const isAdmin = ['admin', 'coo', 'accountant'].includes(req.user.role);

    if (!isAssigned && !isSuperAdmin && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    // Update assignedTo if provided
    if (assignedTo && isSuperAdmin) {
      report.assignedTo = assignedTo;
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        report.assignedToName = assignedUser.name;
        report.assignedToRole = assignedUser.role;
      }
    }

    if (status) {
      report.status = status;
      
      if (status === 'resolved') {
        report.resolvedBy = req.user.id;
        report.resolvedAt = new Date();
        if (resolutionNotes) {
          report.resolutionNotes = resolutionNotes;
        }
      }
    }

    await report.save();

    if (status === 'resolved' || status === 'dismissed') {
      await notificationService.notifyReportUpdate(report, req.user.name, status);
    }

    // Add audit log
    report.auditLog.push({
      action: 'status_updated',
      user: req.user.id,
      userName: req.user.name,
      details: `Status updated to ${status}`
    });
    await report.save();

    await report.populate('reporter', 'name email role');
    await report.populate('assignedTo', 'name email role');
    await report.populate('resolvedBy', 'name email role');

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add comment to report
// @route   POST /api/reports/:id/comments
// @access  Private
const addReportComment = async (req, res) => {
  try {
    const { comment, isInternal } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a comment'
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    const isReporter = report.reporter.toString() === req.user.id;
    const isAssigned = report.assignedTo && report.assignedTo.toString() === req.user.id;
    const isSuperAdmin = ['super_admin', 'ceo', 'founder'].includes(req.user.role);

    if (!isReporter && !isAssigned && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this report'
      });
    }

    report.comments.push({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      comment,
      isInternal: isInternal || false
    });

    await report.save();
    await report.populate('comments.user', 'name email role profilePicture');

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Add report comment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private
const getReportStats = async (req, res) => {
  try {
    const query = {};
    
    if (['staff', 'hr_manager'].includes(req.user.role)) {
      query.reporter = req.user.id;
    }

    const totalReports = await Report.countDocuments(query);
    const pendingReports = await Report.countDocuments({ 
      ...query, 
      status: { $in: ['submitted', 'under_review', 'investigating'] } 
    });
    const resolvedReports = await Report.countDocuments({ ...query, status: 'resolved' });
    const dismissedReports = await Report.countDocuments({ ...query, status: 'dismissed' });

    // Reports by category
    const reportsByCategory = await Report.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Reports by urgency
    const reportsByUrgency = await Report.aggregate([
      { $match: query },
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        resolvedReports,
        dismissedReports,
        reportsByCategory,
        reportsByUrgency
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReport,
  updateReportStatus,
  addReportComment,
  getReportStats
};