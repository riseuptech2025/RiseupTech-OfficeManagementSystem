// controllers/financeController.js
const CompanyFinance = require('../models/CompanyFinance');
const Receipt = require('../models/Receipt');
const Salary = require('../models/Salary');

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
      netProfit: 0,
      companyValue: 15000,
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

// @desc    Get company financial overview
// @route   GET /api/finance/overview
// @access  Private (Admin only)
const getFinancialOverview = async (req, res) => {
  try {
    // Initialize finance if not exists
    let finance = await initializeCompanyFinance();

    // Get total earnings from paid receipts
    const receipts = await Receipt.aggregate([
      { $match: { status: 'paid' } },
      { $group: {
        _id: null,
        total: { $sum: '$totalAmount' }
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

    // Update finance with latest data
    finance.totalEarnings = totalEarnings;
    finance.totalExpenses = totalSalaryExpenses + 15000; // Add initial investment as expense
    
    // Recalculate all values
    finance = await CompanyFinance.calculateShareValues(finance);
    await finance.save();

    // Build shareholder data with values
    const shareholders = finance.shareholders.map(s => ({
      ...s.toObject(),
      shareValue: s.shares * finance.sharePrice,
      percentage: s.percentage || (s.shares / finance.totalShares) * 100
    }));

    // Calculate company valuation
    const companyValuation = finance.companyValue;

    // Calculate share price growth
    const initialSharePrice = 15;
    const sharePriceGrowth = ((finance.sharePrice - initialSharePrice) / initialSharePrice) * 100;

    res.status(200).json({
      success: true,
      data: {
        ...finance.toObject(),
        shareholders,
        totalEarnings,
        totalSalaryExpenses,
        netProfit: finance.netProfit,
        initialInvestment: 15000,
        initialSharePrice: 15,
        sharePriceGrowth: sharePriceGrowth.toFixed(2),
        companyValuation,
        receiptsTotal: totalEarnings,
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

// @desc    Update share details (Super Admin only)
// @route   PUT /api/finance/shares
// @access  Private (Super Admin only)
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

// @desc    Add transaction
// @route   POST /api/finance/transactions
// @access  Private (Admin only)
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
    } else if (type === 'Expense' || type === 'Salary') {
      finance.totalExpenses += parseFloat(amount);
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

// @desc    Get salary breakdown by employee
// @route   GET /api/finance/salaries/breakdown
// @access  Private (Admin only)
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

module.exports = {
  getFinancialOverview,
  updateShares,
  addTransaction,
  getSalaryBreakdown
};