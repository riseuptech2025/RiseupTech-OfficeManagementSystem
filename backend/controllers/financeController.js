// controllers/financeController.js
const CompanyFinance = require('../models/CompanyFinance');
const Receipt = require('../models/Receipt');
const Salary = require('../models/Salary');
const Expenditure = require('../models/Expenditure');

// ============================================
// INITIAL COMPANY FINANCE DATA
// ============================================
// Total Shares: 1000
// Initial Share Price: Rs. 15 per share
// Total Investment: Rs. 15,000
// Shareholders:
//   - Ramanand Mandal: 550 shares (55%) - Rs. 8,250
//   - Dipak Kumar Mandal Khatwe: 450 shares (45%) - Rs. 6,750
// ============================================

// Helper function to initialize company finance
const initializeCompanyFinance = async () => {
  let finance = await CompanyFinance.findOne();
  
  if (!finance) {
    // Create initial finance data
    finance = new CompanyFinance({
      totalShares: 1000,
      sharePrice: 15,
      totalShareValue: 15000,
      initialInvestment: 15000,
      initialSharePrice: 15,
      shareholders: [
        { 
          name: 'Ramanand Mandal', 
          shares: 550,
          investment: 8250,
          percentage: 55
        },
        { 
          name: 'Dipak Kumar Mandal Khatwe', 
          shares: 450,
          investment: 6750,
          percentage: 45
        }
      ],
      totalEarnings: 0,
      totalExpenses: 0,
      totalExpenditure: 0,
      netProfit: 0,
      companyValue: 15000,
      expenditureBreakdown: {
        'Office Rent': 0,
        'Utilities': 0,
        'Salaries': 0,
        'Equipment': 0,
        'Software Licenses': 0,
        'Marketing': 0,
        'Travel': 0,
        'Food & Beverage': 0,
        'Stationery': 0,
        'Maintenance': 0,
        'Insurance': 0,
        'Taxes': 0,
        'Training': 0,
        'Miscellaneous': 0
      },
      transactions: [{
        type: 'Investment',
        category: 'Initial Investment',
        description: 'Initial company investment (1000 shares × Rs. 15)',
        amount: 15000,
        date: new Date(),
        reference: 'INV-001',
        createdByName: 'System'
      }]
    });
    
    await finance.save();
  }
  
  // Recalculate share values based on current earnings/expenses
  finance = await CompanyFinance.calculateShareValues(finance);
  await finance.save();
  
  return finance;
};

// ============================================
// NEW: Update company earnings from receipts (including partial)
// ============================================
const updateCompanyEarningsFromReceipts = async () => {
  try {
    let finance = await CompanyFinance.findOne();
    if (!finance) {
      finance = await initializeCompanyFinance();
    }

    // Get all receipts with paid amount > 0 (including partial payments)
    const allReceipts = await Receipt.find({
      'paidAmount': { $gt: 0 },
      status: { $ne: 'cancelled' }
    });

    // Calculate total earnings from all payments (including partial)
    let totalEarnings = 0;
    allReceipts.forEach(receipt => {
      totalEarnings += receipt.paidAmount || 0;
    });

    // Get total salary expenses
    const salaryExpenses = await Salary.aggregate([
      { $group: {
        _id: null,
        total: { $sum: '$totalSalary' }
      }}
    ]);
    const totalSalaryExpenses = salaryExpenses[0]?.total || 0;

    // Get total expenditure
    const expenditureTotal = await Expenditure.aggregate([
      { $match: { isActive: true, status: { $ne: 'Cancelled' } } },
      { $group: {
        _id: null,
        total: { $sum: '$amount' }
      }}
    ]);
    const totalExpenditure = expenditureTotal[0]?.total || 0;

    // Update finance
    finance.totalEarnings = totalEarnings;
    finance.totalExpenses = totalSalaryExpenses;
    finance.totalExpenditure = totalExpenditure;
    finance.netProfit = totalEarnings - (totalSalaryExpenses + totalExpenditure);
    finance.companyValue = finance.initialInvestment + finance.netProfit;
    finance.sharePrice = finance.companyValue / finance.totalShares;

    await finance.save();
    return finance;
  } catch (error) {
    console.error('Error updating company earnings:', error);
    throw error;
  }
};

// ============================================
// @desc    Get company financial overview with expenditure
// @route   GET /api/finance/overview
// @access  Private (Admin only)
// ============================================
const getFinancialOverview = async (req, res) => {
  try {
    // Initialize finance if not exists
    let finance = await initializeCompanyFinance();

    // Get total earnings from ALL payments (including partial)
    const receipts = await Receipt.aggregate([
      { $match: { status: { $ne: 'cancelled' }, paidAmount: { $gt: 0 } } },
      { $group: {
        _id: null,
        total: { $sum: '$paidAmount' }  // Use paidAmount instead of totalAmount
      }}
    ]);

    const totalEarnings = receipts[0]?.total || 0;
    
    // Get total salary expenses
    const salaryExpenses = await Salary.aggregate([
      { $group: {
        _id: null,
        total: { $sum: '$totalSalary' }
      }}
    ]);

    const totalSalaryExpenses = salaryExpenses[0]?.total || 0;

    // Get total expenditure from Expenditure model
    const expenditureTotal = await Expenditure.aggregate([
      { $match: { isActive: true, status: { $ne: 'Cancelled' } } },
      { $group: {
        _id: null,
        total: { $sum: '$amount' }
      }}
    ]);

    const totalExpenditure = expenditureTotal[0]?.total || 0;

    // Get expenditure breakdown by category
    const expenditureByCategory = await Expenditure.aggregate([
      { $match: { isActive: true, status: { $ne: 'Cancelled' } } },
      { $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { total: -1 } }
    ]);

    // Get receipt statistics
    const receiptStats = await Receipt.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$paidAmount' },
        totalDue: { $sum: '$dueAmount' }
      }}
    ]);

    // Update finance with latest data
    finance.totalEarnings = totalEarnings;
    finance.totalExpenses = totalSalaryExpenses;
    finance.totalExpenditure = totalExpenditure;
    
    // Update expenditure breakdown
    if (finance.expenditureBreakdown) {
      // Reset all categories to 0 first
      const categories = [
        'Office Rent', 'Utilities', 'Salaries', 'Equipment', 'Software Licenses',
        'Marketing', 'Travel', 'Food & Beverage', 'Stationery', 'Maintenance',
        'Insurance', 'Taxes', 'Training', 'Miscellaneous'
      ];
      categories.forEach(cat => {
        finance.expenditureBreakdown[cat] = 0;
      });
      
      // Update with actual values
      expenditureByCategory.forEach(item => {
        if (finance.expenditureBreakdown[item._id] !== undefined) {
          finance.expenditureBreakdown[item._id] = item.total;
        }
      });
    }
    
    // Recalculate all values
    finance.netProfit = totalEarnings - (totalSalaryExpenses + totalExpenditure);
    finance.companyValue = finance.initialInvestment + finance.netProfit;
    finance.sharePrice = finance.companyValue / finance.totalShares;
    await finance.save();

    // Build shareholder data with values
    const shareholders = finance.shareholders.map(s => ({
      ...s.toObject(),
      shareValue: s.shares * finance.sharePrice,
      percentage: s.percentage || (s.shares / finance.totalShares) * 100
    }));

    // Calculate share price growth
    const initialSharePrice = 15;
    const sharePriceGrowth = ((finance.sharePrice - initialSharePrice) / initialSharePrice) * 100;

    // Calculate total expenses breakdown
    const totalExpenses = {
      salaries: totalSalaryExpenses,
      expenditure: totalExpenditure,
      initialInvestment: 15000,
      total: totalSalaryExpenses + totalExpenditure + 15000
    };

    res.status(200).json({
      success: true,
      data: {
        ...finance.toObject(),
        shareholders,
        totalEarnings,
        totalExpenses: totalExpenses,
        totalExpenditure,
        netProfit: finance.netProfit,
        initialInvestment: 15000,
        initialSharePrice: 15,
        sharePriceGrowth: sharePriceGrowth.toFixed(2),
        companyValuation: finance.companyValue,
        receiptsTotal: totalEarnings,
        receiptStats,
        expenditureBreakdown: expenditureByCategory,
        shareDetails: {
          totalShares: finance.totalShares,
          sharePrice: finance.sharePrice,
          totalShareValue: finance.totalShareValue,
          initialSharePrice: 15,
          sharePriceGrowth: sharePriceGrowth.toFixed(2),
          shareholders: shareholders
        }
      }
    });
  } catch (error) {
    console.error('Get financial overview error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// @desc    Get receipt earnings breakdown
// @route   GET /api/finance/receipt-earnings
// @access  Private (Admin only)
// ============================================
const getReceiptEarningsBreakdown = async (req, res) => {
  try {
    const receipts = await Receipt.find({
      paidAmount: { $gt: 0 },
      status: { $ne: 'cancelled' }
    })
    .populate('customerId', 'name phone')
    .sort({ createdAt: -1 });

    const breakdown = {
      totalEarned: 0,
      totalPending: 0,
      totalPaidFull: 0,
      totalPartial: 0,
      receipts: receipts.map(r => ({
        receiptNumber: r.receiptNumber,
        customerName: r.recipientName,
        totalAmount: r.totalAmount,
        paidAmount: r.paidAmount,
        dueAmount: r.dueAmount,
        status: r.status,
        paymentStatus: r.paymentStatus,
        date: r.createdAt
      }))
    };

    receipts.forEach(r => {
      breakdown.totalEarned += r.paidAmount;
      if (r.paymentStatus === 'Paid') {
        breakdown.totalPaidFull += r.paidAmount;
      } else if (r.paymentStatus === 'Partial') {
        breakdown.totalPartial += r.paidAmount;
      }
    });

    res.status(200).json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Get receipt earnings breakdown error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// @desc    Update share details (Super Admin only)
// @route   PUT /api/finance/shares
// @access  Private (Super Admin only)
// ============================================
const updateShares = async (req, res) => {
  try {
    const { shareholders, totalShares, sharePrice } = req.body;

    let finance = await CompanyFinance.findOne();
    if (!finance) {
      finance = await initializeCompanyFinance();
    }

    if (shareholders) {
      // Ensure total shares sum to 1000
      const totalSharesCount = shareholders.reduce((sum, s) => sum + s.shares, 0);
      if (totalSharesCount !== 1000) {
        return res.status(400).json({
          success: false,
          message: `Total shares must equal 1000. Current total: ${totalSharesCount}`
        });
      }
      finance.shareholders = shareholders;
    }
    if (totalShares) {
      if (totalShares !== 1000) {
        return res.status(400).json({
          success: false,
          message: 'Total shares must remain 1000'
        });
      }
      finance.totalShares = totalShares;
    }
    if (sharePrice) {
      finance.sharePrice = sharePrice;
    }

    // Recalculate all values
    finance = await CompanyFinance.calculateShareValues(finance);
    await finance.save();

    res.status(200).json({
      success: true,
      data: finance
    });
  } catch (error) {
    console.error('Update shares error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// @desc    Add transaction
// @route   POST /api/finance/transactions
// @access  Private (Admin only)
// ============================================
const addTransaction = async (req, res) => {
  try {
    const { type, category, description, amount, reference } = req.body;

    if (!type || !category || !description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    let finance = await CompanyFinance.findOne();
    if (!finance) {
      finance = await initializeCompanyFinance();
    }

    const transaction = {
      type,
      category,
      description,
      amount: parseFloat(amount),
      date: new Date(),
      reference: reference || '',
      createdBy: req.user.id,
      createdByName: req.user.name
    };

    finance.transactions.push(transaction);

    if (type === 'Income') {
      finance.totalEarnings += parseFloat(amount);
    } else if (type === 'Expense') {
      finance.totalExpenses += parseFloat(amount);
    } else if (type === 'Expenditure') {
      finance.totalExpenditure += parseFloat(amount);
    }

    // Recalculate all values
    finance = await CompanyFinance.calculateShareValues(finance);
    await finance.save();

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// @desc    Get salary breakdown by employee
// @route   GET /api/finance/salaries/breakdown
// @access  Private (Admin only)
// ============================================
const getSalaryBreakdown = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const salaries = await Salary.find({
      month: currentMonth,
      year: currentYear
    }).populate('employee', 'name role department');

    const breakdown = {
      total: 0,
      paid: 0,
      due: 0,
      byRole: {},
      byEmployee: salaries.map(s => ({
        name: s.employeeName,
        role: s.employeeRole,
        total: s.totalSalary,
        paid: s.paidAmount,
        due: s.dueAmount,
        status: s.paymentStatus
      }))
    };

    salaries.forEach(s => {
      breakdown.total += s.totalSalary;
      breakdown.paid += s.paidAmount;
      breakdown.due += s.dueAmount;

      if (!breakdown.byRole[s.employeeRole]) {
        breakdown.byRole[s.employeeRole] = { total: 0, paid: 0, due: 0, count: 0 };
      }
      breakdown.byRole[s.employeeRole].total += s.totalSalary;
      breakdown.byRole[s.employeeRole].paid += s.paidAmount;
      breakdown.byRole[s.employeeRole].due += s.dueAmount;
      breakdown.byRole[s.employeeRole].count += 1;
    });

    res.status(200).json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Get salary breakdown error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// @desc    Get expenditure breakdown
// @route   GET /api/finance/expenditure-breakdown
// @access  Private (Admin only)
// ============================================
const getExpenditureBreakdown = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { isActive: true, status: { $ne: 'Cancelled' } };
    
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    const breakdown = await Expenditure.aggregate([
      { $match: query },
      { $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { total: -1 } }
    ]);

    const total = await Expenditure.aggregate([
      { $match: query },
      { $group: {
        _id: null,
        total: { $sum: '$amount' }
      }}
    ]);

    res.status(200).json({
      success: true,
      data: {
        breakdown,
        total: total[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get expenditure breakdown error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// @desc    Get financial summary
// @route   GET /api/finance/summary
// @access  Private (Admin only)
// ============================================
const getFinancialSummary = async (req, res) => {
  try {
    const finance = await initializeCompanyFinance();
    
    // Get current month's data
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlyReport = finance.monthlyReports.find(
      r => r.month === currentMonth && r.year === currentYear
    );

    // Get total earnings from ALL payments (including partial)
    const receipts = await Receipt.aggregate([
      { $match: { status: { $ne: 'cancelled' }, paidAmount: { $gt: 0 } } },
      { $group: {
        _id: null,
        total: { $sum: '$paidAmount' }
      }}
    ]);
    const totalEarnings = receipts[0]?.total || 0;

    const summary = {
      totalEarnings: totalEarnings,
      totalExpenses: finance.totalExpenses || 0,
      totalExpenditure: finance.totalExpenditure || 0,
      netProfit: totalEarnings - (finance.totalExpenses || 0) - (finance.totalExpenditure || 0),
      companyValue: finance.companyValue || 0,
      sharePrice: finance.sharePrice || 15,
      monthlyEarnings: monthlyReport?.earnings || 0,
      monthlyExpenses: monthlyReport?.expenses || 0,
      monthlyProfit: monthlyReport?.profit || 0,
      shareholders: finance.shareholders || []
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// @desc    Get earnings from receipts (including partial)
// @route   GET /api/finance/earnings
// @access  Private (Admin only)
// ============================================
const getEarnings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { 
      paidAmount: { $gt: 0 },
      status: { $ne: 'cancelled' }
    };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const receipts = await Receipt.find(query)
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    const totalEarned = receipts.reduce((sum, r) => sum + r.paidAmount, 0);
    
    const breakdown = {
      totalEarned,
      count: receipts.length,
      fullPayments: receipts.filter(r => r.paymentStatus === 'Paid').length,
      partialPayments: receipts.filter(r => r.paymentStatus === 'Partial').length,
      receipts: receipts.map(r => ({
        receiptNumber: r.receiptNumber,
        customerName: r.recipientName,
        totalAmount: r.totalAmount,
        paidAmount: r.paidAmount,
        dueAmount: r.dueAmount,
        paymentStatus: r.paymentStatus,
        date: r.createdAt
      }))
    };

    res.status(200).json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
  getFinancialOverview,
  updateShares,
  addTransaction,
  getSalaryBreakdown,
  getExpenditureBreakdown,
  getFinancialSummary,
  getEarnings,
  getReceiptEarningsBreakdown,
  updateCompanyEarningsFromReceipts,
  initializeCompanyFinance
};