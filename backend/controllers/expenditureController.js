// controllers/expenditureController.js
const Expenditure = require('../models/Expenditure');
const User = require('../models/User');
const CompanyFinance = require('../models/CompanyFinance');
const notificationService = require('../services/notificationService');

// ============================================
// Helper: Generate Receipt Number
// ============================================
const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const count = await Expenditure.countDocuments() + 1;
  return `RT-EXP-${month}-${String(count).padStart(4, '0')}`;
};

// ============================================
// Helper: Update Company Finances
// ============================================
const updateCompanyFinances = async (expenditure, action, oldValues = null, paymentAmount = 0) => {
  try {
    let finance = await CompanyFinance.findOne();
    if (!finance) {
      finance = await CompanyFinance.create({
        totalShares: 1000,
        sharePrice: 15,
        totalShareValue: 15000,
        initialInvestment: 15000,
        shareholders: [
          { name: 'Ramanand Mandal', shares: 550, investment: 8250, percentage: 55 },
          { name: 'Dipak Kumar Mandal Khatwe', shares: 450, investment: 6750, percentage: 45 }
        ],
        totalEarnings: 0,
        totalExpenses: 0,
        netProfit: 0,
        companyValue: 15000
      });
    }

    if (action === 'create' || action === 'update') {
      const expenseAmount = action === 'create' ? expenditure.amount : 
                           (expenditure.amount - (oldValues?.amount || 0));
      
      if (action === 'create') {
        finance.totalExpenses += expenditure.amount;
      } else if (action === 'update') {
        finance.totalExpenses += (expenditure.amount - (oldValues?.amount || 0));
      }
      
      finance.netProfit = finance.totalEarnings - finance.totalExpenses;
    } else if (action === 'delete') {
      finance.totalExpenses -= expenditure.amount;
      finance.netProfit = finance.totalEarnings - finance.totalExpenses;
    }

    // Recalculate share values
    const totalShares = finance.totalShares || 1000;
    finance.shareholders.forEach(shareholder => {
      shareholder.percentage = (shareholder.shares / totalShares) * 100;
    });
    finance.totalShareValue = totalShares * finance.sharePrice;
    finance.companyValue = finance.netProfit + finance.initialInvestment;
    finance.sharePrice = finance.companyValue / totalShares;

    await finance.save();
  } catch (error) {
    console.error('Update company finances error:', error);
  }
};

// @desc    Create expenditure receipt
// @route   POST /api/expenditures
// @access  Private (Admin/Super Admin only)
const createExpenditure = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      description,
      amount,
      currency,
      paidAmount,
      paymentMethod,
      paymentReference,
      transactionDate,
      vendorName,
      vendorPhone,
      vendorEmail,
      vendorAddress,
      panNumber,
      invoiceNumber,
      approvedBy,
      notes,
      attachments,
      status
    } = req.body;

    // Validate required fields
    if (!category || !description || !amount || !vendorName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, description, amount and vendor name'
      });
    }

    // Check if user is authorized
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo', 'accountant'].includes(req.user.role);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create expenditure receipts'
      });
    }

    const paidAmountValue = parseFloat(paidAmount) || 0;
    const totalAmount = parseFloat(amount);
    const dueAmount = Math.max(0, totalAmount - paidAmountValue);

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();

    // Determine payment status
    let paymentStatus = 'Pending';
    if (paidAmountValue >= totalAmount) {
      paymentStatus = 'Paid';
    } else if (paidAmountValue > 0) {
      paymentStatus = 'Partial';
    }

    const expenditureData = {
      receiptNumber,
      category,
      subCategory: subCategory || '',
      description,
      amount: totalAmount,
      currency: currency || 'NPR',
      paidAmount: paidAmountValue,
      dueAmount: dueAmount,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod || 'Cash',
      paymentReference: paymentReference || '',
      transactionDate: transactionDate || new Date(),
      vendorName,
      vendorPhone: vendorPhone || '',
      vendorEmail: vendorEmail || '',
      vendorAddress: vendorAddress || '',
      panNumber: panNumber || '',
      invoiceNumber: invoiceNumber || '',
      approvedBy: approvedBy || null,
      notes: notes || '',
      attachments: attachments || [],
      createdBy: req.user.id,
      createdByName: req.user.name,
      status: status || (paidAmountValue >= totalAmount ? 'Paid' : 'Approved')
    };

    // If paid, set payment date
    if (paymentStatus === 'Paid') {
      expenditureData.paymentDate = new Date();
    }

    // If approvedBy is provided, set approved details
    if (approvedBy) {
      const approver = await User.findById(approvedBy);
      if (approver) {
        expenditureData.approvedByName = approver.name;
        expenditureData.approvedAt = new Date();
      }
    }

    const expenditure = new Expenditure(expenditureData);
    await expenditure.save();

    // Add audit log
    expenditure.auditLog.push({
      action: 'created',
      user: req.user.id,
      userName: req.user.name,
      details: `Expenditure ${expenditure.receiptNumber} created`
    });
    await expenditure.save();

    // Update company finances
    await updateCompanyFinances(expenditure, 'create');

    // Send notification to approver if specified
    if (approvedBy) {
      await notificationService.createNotification({
        recipient: approvedBy,
        sender: req.user.id,
        senderName: req.user.name,
        type: 'system_alert',
        title: `New Expenditure - ${expenditure.receiptNumber}`,
        message: `A new expenditure of ${expenditure.currency} ${expenditure.amount.toFixed(2)} has been created for ${expenditure.category}`,
        data: { expenditureId: expenditure._id },
        link: `/expenditures/${expenditure._id}`,
        priority: 'high'
      });
    }

    // Populate for response
    await expenditure.populate('createdBy', 'name email role');
    await expenditure.populate('approvedBy', 'name email role');

    res.status(201).json({
      success: true,
      data: expenditure
    });
  } catch (error) {
    console.error('Create expenditure error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all expenditures
// @route   GET /api/expenditures
// @access  Private
const getExpenditures = async (req, res) => {
  try {
    const { 
      category, 
      status, 
      paymentStatus, 
      startDate, 
      endDate, 
      search,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const expenditures = await Expenditure.find(query)
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('updatedBy', 'name email role');

    const total = await Expenditure.countDocuments(query);

    // Calculate summary
    const summary = await Expenditure.aggregate([
      { $match: query },
      { $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalPaid: { $sum: '$paidAmount' },
        totalDue: { $sum: '$dueAmount' },
        count: { $sum: 1 }
      }}
    ]);

    res.status(200).json({
      success: true,
      count: expenditures.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: expenditures,
      summary: summary[0] || { totalAmount: 0, totalPaid: 0, totalDue: 0, count: 0 }
    });
  } catch (error) {
    console.error('Get expenditures error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single expenditure
// @route   GET /api/expenditures/:id
// @access  Private
const getExpenditure = async (req, res) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expenditure
    });
  } catch (error) {
    console.error('Get expenditure error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update expenditure
// @route   PUT /api/expenditures/:id
// @access  Private (Admin/Super Admin only)
const updateExpenditure = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      description,
      amount,
      currency,
      paidAmount,
      paymentMethod,
      paymentReference,
      transactionDate,
      vendorName,
      vendorPhone,
      vendorEmail,
      vendorAddress,
      panNumber,
      invoiceNumber,
      approvedBy,
      notes,
      attachments,
      status
    } = req.body;

    const expenditure = await Expenditure.findById(req.params.id);

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    // Check if user is authorized
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo', 'accountant'].includes(req.user.role);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update expenditure receipts'
      });
    }

    // Store old values for audit
    const oldValues = {
      amount: expenditure.amount,
      status: expenditure.status,
      paymentStatus: expenditure.paymentStatus
    };

    // Update fields
    if (category) expenditure.category = category;
    if (subCategory !== undefined) expenditure.subCategory = subCategory;
    if (description) expenditure.description = description;
    if (amount) expenditure.amount = parseFloat(amount);
    if (currency) expenditure.currency = currency;
    if (paidAmount !== undefined) expenditure.paidAmount = parseFloat(paidAmount);
    if (paymentMethod) expenditure.paymentMethod = paymentMethod;
    if (paymentReference !== undefined) expenditure.paymentReference = paymentReference;
    if (transactionDate) expenditure.transactionDate = transactionDate;
    if (vendorName) expenditure.vendorName = vendorName;
    if (vendorPhone !== undefined) expenditure.vendorPhone = vendorPhone;
    if (vendorEmail !== undefined) expenditure.vendorEmail = vendorEmail;
    if (vendorAddress !== undefined) expenditure.vendorAddress = vendorAddress;
    if (panNumber !== undefined) expenditure.panNumber = panNumber;
    if (invoiceNumber !== undefined) expenditure.invoiceNumber = invoiceNumber;
    if (notes !== undefined) expenditure.notes = notes;
    if (attachments) expenditure.attachments = attachments;
    if (status) expenditure.status = status;

    if (approvedBy) {
      expenditure.approvedBy = approvedBy;
      const approver = await User.findById(approvedBy);
      if (approver) {
        expenditure.approvedByName = approver.name;
        expenditure.approvedAt = new Date();
      }
    }

    // Recalculate due amount
    expenditure.dueAmount = Math.max(0, expenditure.amount - expenditure.paidAmount);
    if (expenditure.paidAmount >= expenditure.amount) {
      expenditure.paymentStatus = 'Paid';
      expenditure.status = 'Paid';
    } else if (expenditure.paidAmount > 0) {
      expenditure.paymentStatus = 'Partial';
      expenditure.status = 'Approved';
    }

    expenditure.updatedBy = req.user.id;
    await expenditure.save();

    // Add audit log
    expenditure.auditLog.push({
      action: 'updated',
      user: req.user.id,
      userName: req.user.name,
      details: `Expenditure ${expenditure.receiptNumber} updated`
    });
    await expenditure.save();

    // Update company finances
    await updateCompanyFinances(expenditure, 'update', oldValues);

    await expenditure.populate('createdBy', 'name email role');
    await expenditure.populate('approvedBy', 'name email role');

    res.status(200).json({
      success: true,
      data: expenditure
    });
  } catch (error) {
    console.error('Update expenditure error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete expenditure (soft delete)
// @route   DELETE /api/expenditures/:id
// @access  Private (Admin/Super Admin only)
const deleteExpenditure = async (req, res) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id);

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    // Check if user is authorized
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo', 'accountant'].includes(req.user.role);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete expenditure receipts'
      });
    }

    expenditure.isActive = false;
    expenditure.status = 'Cancelled';
    await expenditure.save();

    // Add audit log
    expenditure.auditLog.push({
      action: 'deleted',
      user: req.user.id,
      userName: req.user.name,
      details: `Expenditure ${expenditure.receiptNumber} deleted`
    });
    await expenditure.save();

    // Update company finances (remove expense)
    await updateCompanyFinances(expenditure, 'delete');

    res.status(200).json({
      success: true,
      message: 'Expenditure deleted successfully'
    });
  } catch (error) {
    console.error('Delete expenditure error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Process payment for expenditure
// @route   PUT /api/expenditures/:id/pay
// @access  Private (Admin/Super Admin only)
const processPayment = async (req, res) => {
  try {
    const { amount, method, reference, date } = req.body;
    const expenditure = await Expenditure.findById(req.params.id);

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    // Check if user is authorized
    const isAdmin = ['super_admin', 'admin', 'ceo', 'founder', 'coo', 'accountant'].includes(req.user.role);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process payments'
      });
    }

    if (expenditure.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This expenditure is already fully paid'
      });
    }

    const paymentAmount = parseFloat(amount) || expenditure.dueAmount;
    const actualPayment = Math.min(paymentAmount, expenditure.dueAmount);

    expenditure.paidAmount += actualPayment;
    expenditure.dueAmount = expenditure.amount - expenditure.paidAmount;

    if (expenditure.paidAmount >= expenditure.amount) {
      expenditure.paymentStatus = 'Paid';
      expenditure.status = 'Paid';
      expenditure.paymentDate = date || new Date();
    } else if (expenditure.paidAmount > 0) {
      expenditure.paymentStatus = 'Partial';
      expenditure.status = 'Approved';
    }

    if (method) expenditure.paymentMethod = method;
    if (reference) expenditure.paymentReference = reference;

    expenditure.updatedBy = req.user.id;
    await expenditure.save();

    // Add audit log
    expenditure.auditLog.push({
      action: 'payment_processed',
      user: req.user.id,
      userName: req.user.name,
      details: `Payment of ${expenditure.currency} ${actualPayment.toFixed(2)} processed for ${expenditure.receiptNumber}`
    });
    await expenditure.save();

    await expenditure.populate('createdBy', 'name email role');
    await expenditure.populate('approvedBy', 'name email role');

    res.status(200).json({
      success: true,
      data: expenditure,
      paymentAmount: actualPayment
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get expenditure statistics
// @route   GET /api/expenditures/stats
// @access  Private
const getExpenditureStats = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Total expenditures
    const totalStats = await Expenditure.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalPaid: { $sum: '$paidAmount' },
        totalDue: { $sum: '$dueAmount' },
        count: { $sum: 1 }
      }}
    ]);

    // Monthly expenditures
    const monthlyStats = await Expenditure.aggregate([
      { $match: { 
        isActive: true,
        $expr: {
          $and: [
            { $eq: [{ $month: '$transactionDate' }, currentMonth] },
            { $eq: [{ $year: '$transactionDate' }, currentYear] }
          ]
        }
      }},
      { $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalPaid: { $sum: '$paidAmount' },
        totalDue: { $sum: '$dueAmount' },
        count: { $sum: 1 }
      }}
    ]);

    // By category
    const categoryStats = await Expenditure.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { totalAmount: -1 } }
    ]);

    // By status
    const statusStats = await Expenditure.aggregate([
      { $match: { isActive: true } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }}
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalStats[0] || { totalAmount: 0, totalPaid: 0, totalDue: 0, count: 0 },
        monthly: monthlyStats[0] || { totalAmount: 0, totalPaid: 0, totalDue: 0, count: 0 },
        byCategory: categoryStats,
        byStatus: statusStats
      }
    });
  } catch (error) {
    console.error('Get expenditure stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createExpenditure,
  getExpenditures,
  getExpenditure,
  updateExpenditure,
  deleteExpenditure,
  processPayment,
  getExpenditureStats
};