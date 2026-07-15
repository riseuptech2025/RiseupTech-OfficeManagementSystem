// controllers/salaryController.js
const Salary = require('../models/Salary');
const User = require('../models/User');
const CompanyFinance = require('../models/CompanyFinance');

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate working days in a month
const getWorkingDaysInMonth = (month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
};

// Calculate prorated salary based on join date
const calculateProratedSalary = (basicSalary, joinDate, month, year) => {
  const joinDay = joinDate.getDate();
  const workingDaysInMonth = getWorkingDaysInMonth(month, year);
  
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const daysWorked = lastDayOfMonth - joinDay + 1;
  
  const dailySalary = basicSalary / workingDaysInMonth;
  const proratedSalary = dailySalary * daysWorked;
  
  return {
    proratedSalary,
    daysWorked,
    workingDaysInMonth,
    proratedPercentage: (daysWorked / workingDaysInMonth) * 100
  };
};

// Update company finances
const updateCompanyFinancesForSalary = async (salary, action, amount = null) => {
  let finance = await CompanyFinance.findOne();
  if (!finance) {
    finance = await CompanyFinance.create({
      totalShares: 150,
      sharePrice: 100,
      totalShareValue: 15000,
      shareholders: [
        { name: 'Ramanand Mandal', shares: 80 },
        { name: 'Dipak Kumar Mandal Khatwe', shares: 70 }
      ],
      totalEarnings: 0,
      totalExpenses: 0,
      netProfit: 0
    });
  }

  const expenseAmount = action === 'create' ? salary.totalSalary : (amount || 0);
  
  if (action === 'create') {
    finance.totalExpenses += expenseAmount;
    finance.netProfit = finance.totalEarnings - finance.totalExpenses;
  }

  const monthReport = finance.monthlyReports.find(
    r => r.month === salary.month && r.year === salary.year
  );

  if (monthReport) {
    if (action === 'create') {
      monthReport.salaryExpenses = (monthReport.salaryExpenses || 0) + expenseAmount;
      monthReport.expenses = (monthReport.expenses || 0) + expenseAmount;
    }
    monthReport.profit = (monthReport.earnings || 0) - (monthReport.expenses || 0);
  } else if (action === 'create') {
    finance.monthlyReports.push({
      month: salary.month,
      year: salary.year,
      salaryExpenses: expenseAmount,
      expenses: expenseAmount,
      earnings: 0,
      profit: -expenseAmount
    });
  }

  const totalShares = finance.totalShares || 150;
  finance.shareholders.forEach(shareholder => {
    shareholder.percentage = (shareholder.shares / totalShares) * 100;
  });
  finance.totalShareValue = totalShares * finance.sharePrice;
  finance.netProfit = finance.totalEarnings - finance.totalExpenses;
  
  await finance.save();
  return finance;
};

// ============================================
// AUTO-GENERATE SALARIES (FIXED)
// ============================================
const autoGenerateSalaries = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Get all active employees
    const activeEmployees = await User.find({ isActive: true });

    let createdCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const employee of activeEmployees) {
      // Get employee's latest salary record (to get join date and salary details)
      const latestSalary = await Salary.findOne({
        employee: employee._id
      }).sort({ year: -1, month: -1 });

      if (!latestSalary) {
        skippedCount++;
        continue;
      }

      // Get join date from latest salary record
      const joinDate = latestSalary.joinDate;
      const joinMonth = joinDate.getMonth() + 1;
      const joinYear = joinDate.getFullYear();

      // ============================================
      // Calculate months from join date to current month
      // ============================================
      let totalMonths = (currentYear - joinYear) * 12 + (currentMonth - joinMonth);
      
      // If employee joined in the current month, they shouldn't have past salaries
      if (totalMonths < 0) {
        skippedCount++;
        continue;
      }

      // ============================================
      // Determine fiscal year (July to June)
      // ============================================
      let fiscalYearStartMonth = 7; // July
      let fiscalYearStartYear = currentYear;
      
      // If current month is before July, fiscal year started last year
      if (currentMonth < 7) {
        fiscalYearStartYear = currentYear - 1;
      }
      
      const fiscalYearStart = new Date(fiscalYearStartYear, 6, 1); // July 1
      
      // ============================================
      // Generate salaries for all months from join date
      // up to current month (excluding current month)
      // ============================================
      let startMonth = joinMonth;
      let startYear = joinYear;
      
      // If employee joined before the fiscal year start
      if (joinYear < fiscalYearStartYear || (joinYear === fiscalYearStartYear && joinMonth < 7)) {
        startMonth = 7;
        startYear = fiscalYearStartYear;
      }
      
      // Calculate total months to generate (up to previous month)
      let targetMonth = currentMonth;
      let targetYear = currentYear;
      
      // If current month is the generation month, only go up to previous month
      if (targetMonth === currentMonth && targetYear === currentYear) {
        targetMonth = currentMonth - 1;
        if (targetMonth === 0) {
          targetMonth = 12;
          targetYear = currentYear - 1;
        }
      }
      
      // Generate salaries for each month
      let monthIterator = startMonth;
      let yearIterator = startYear;
      
      while (true) {
        // Check if we've reached the target month
        if (yearIterator > targetYear || (yearIterator === targetYear && monthIterator > targetMonth)) {
          break;
        }
        
        // Check if salary already exists for this month
        const existingSalary = await Salary.findOne({
          employee: employee._id,
          month: monthIterator,
          year: yearIterator
        });

        if (!existingSalary) {
          // Calculate total salary (same as latest)
          const totalSalary = latestSalary.basicSalary + 
                              latestSalary.bonus + 
                              latestSalary.allowance - 
                              latestSalary.deductions;

          // Check if this is the joining month (prorated)
          let finalSalary = totalSalary;
          let isProrated = false;
          let proratedDays = 0;
          let workingDaysInMonth = 0;

          if (monthIterator === joinMonth && yearIterator === joinYear) {
            const proratedData = calculateProratedSalary(
              latestSalary.basicSalary, 
              joinDate, 
              monthIterator, 
              yearIterator
            );
            finalSalary = proratedData.proratedSalary;
            isProrated = true;
            proratedDays = proratedData.daysWorked;
            workingDaysInMonth = proratedData.workingDaysInMonth;
          }

          // Create salary record
          const salary = new Salary({
            employee: employee._id,
            employeeName: employee.name,
            employeeRole: employee.role,
            employeeDepartment: employee.department,
            joinDate: joinDate,
            basicSalary: latestSalary.basicSalary,
            bonus: latestSalary.bonus,
            allowance: latestSalary.allowance,
            deductions: latestSalary.deductions,
            totalSalary: finalSalary,
            paidAmount: 0,
            dueAmount: finalSalary,
            paymentStatus: 'Pending',
            month: monthIterator,
            year: yearIterator,
            isProrated: isProrated,
            proratedDays: proratedDays,
            workingDaysInMonth: workingDaysInMonth,
            createdBy: req.user.id,
            createdByName: req.user.name,
            isActive: true
          });

          await salary.save();
          await updateCompanyFinancesForSalary(salary, 'create');
          createdCount++;
        } else {
          // Check if there's any due amount from previous years
          if (existingSalary.dueAmount > 0) {
            // This salary exists but has due amount - keep it
            updatedCount++;
          }
          skippedCount++;
        }
        
        // Move to next month
        monthIterator++;
        if (monthIterator > 12) {
          monthIterator = 1;
          yearIterator++;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Auto-generated salaries: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped`,
      createdCount,
      updatedCount,
      skippedCount,
      month: currentMonth - 1,
      year: currentMonth === 1 ? currentYear - 1 : currentYear
    });
  } catch (error) {
    console.error('Auto-generate salaries error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// ADVANCE SALARY (FIXED)
// ============================================
const requestAdvanceSalary = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const employeeId = req.params.id;

    // Validate employee
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get employee's latest salary to calculate max advance
    const latestSalary = await Salary.findOne({
      employee: employeeId
    }).sort({ year: -1, month: -1 });

    if (!latestSalary) {
      return res.status(400).json({
        success: false,
        message: 'No salary record found for this employee'
      });
    }

    // ============================================
    // Calculate max advance (3 months salary)
    // ============================================
    const monthlySalary = latestSalary.totalSalary;
    const maxAdvance = monthlySalary * 3;

    if (parseFloat(amount) > maxAdvance) {
      return res.status(400).json({
        success: false,
        message: `Maximum advance allowed is 3 months salary (${maxAdvance}). Please apply for a lower amount.`
      });
    }

    // Check if employee already took advance this fiscal year
    const currentYear = new Date().getFullYear();
    const fiscalYearStart = new Date(currentYear, 6, 1); // July 1
    const fiscalYearEnd = new Date(currentYear + 1, 5, 30); // June 30

    const advanceTaken = await Salary.findOne({
      employee: employeeId,
      advanceStatus: { $in: ['Approved', 'Paid'] },
      createdAt: { $gte: fiscalYearStart, $lte: fiscalYearEnd }
    });

    if (advanceTaken) {
      return res.status(400).json({
        success: false,
        message: 'You have already taken an advance salary this fiscal year'
      });
    }

    // Calculate advance with 3% interest
    const advanceAmount = parseFloat(amount);
    const interestAmount = advanceAmount * (3 / 100);
    const totalAdvanceAmount = advanceAmount + interestAmount;

    // Update latest salary with advance info
    latestSalary.advanceSalary = totalAdvanceAmount;
    latestSalary.advanceInterest = interestAmount;
    latestSalary.advanceInterestRate = 3;
    latestSalary.advanceTakenDate = new Date();
    latestSalary.advanceApprovedBy = req.user.id;
    latestSalary.advanceApprovedByName = req.user.name;
    latestSalary.advanceStatus = 'Approved';
    latestSalary.advanceRemaining = totalAdvanceAmount;
    latestSalary.advanceDeductionPerMonth = Math.ceil(totalAdvanceAmount / 6);

    await latestSalary.save();

    // Also update current month salary if exists
    const currentMonth = new Date().getMonth() + 1;
    const currentYearDate = new Date().getFullYear();
    const currentSalary = await Salary.findOne({
      employee: employeeId,
      month: currentMonth,
      year: currentYearDate
    });

    if (currentSalary && currentSalary._id !== latestSalary._id) {
      currentSalary.advanceSalary = totalAdvanceAmount;
      currentSalary.advanceInterest = interestAmount;
      currentSalary.advanceInterestRate = 3;
      currentSalary.advanceTakenDate = new Date();
      currentSalary.advanceApprovedBy = req.user.id;
      currentSalary.advanceApprovedByName = req.user.name;
      currentSalary.advanceStatus = 'Approved';
      currentSalary.advanceRemaining = totalAdvanceAmount;
      currentSalary.advanceDeductionPerMonth = Math.ceil(totalAdvanceAmount / 6);
      await currentSalary.save();
    }

    res.status(200).json({
      success: true,
      data: latestSalary,
      message: `Advance salary of Rs. ${advanceAmount} approved with 3% interest (Total: Rs. ${totalAdvanceAmount}). Max advance allowed: ${maxAdvance}`
    });
  } catch (error) {
    console.error('Request advance salary error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// CREATE SALARY (FIXED)
// ============================================
const createSalary = async (req, res) => {
  try {
    const {
      employee,
      joinDate,
      basicSalary,
      bonus,
      allowance,
      deductions,
      month,
      year,
      notes
    } = req.body;

    if (!employee || !joinDate || !basicSalary || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employee, join date, basic salary, month and year'
      });
    }

    const employeeData = await User.findById(employee);
    if (!employeeData) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const existingSalary = await Salary.findOne({
      employee,
      month,
      year
    });

    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: 'Salary already exists for this employee for this month'
      });
    }

    const totalBaseSalary = parseFloat(basicSalary) + parseFloat(bonus || 0) + parseFloat(allowance || 0) - parseFloat(deductions || 0);

    const joinDateObj = new Date(joinDate);
    let finalSalary = totalBaseSalary;
    let isProrated = false;
    let proratedDays = 0;
    let workingDaysInMonth = 0;

    if (joinDateObj.getMonth() + 1 === parseInt(month) && joinDateObj.getFullYear() === parseInt(year)) {
      const proratedData = calculateProratedSalary(totalBaseSalary, joinDateObj, parseInt(month), parseInt(year));
      finalSalary = proratedData.proratedSalary;
      isProrated = true;
      proratedDays = proratedData.daysWorked;
      workingDaysInMonth = proratedData.workingDaysInMonth;
    }

    const salary = new Salary({
      employee,
      employeeName: employeeData.name,
      employeeRole: employeeData.role,
      employeeDepartment: employeeData.department,
      joinDate: joinDateObj,
      basicSalary: parseFloat(basicSalary),
      bonus: parseFloat(bonus || 0),
      allowance: parseFloat(allowance || 0),
      deductions: parseFloat(deductions || 0),
      totalSalary: finalSalary,
      paidAmount: 0,
      dueAmount: finalSalary,
      paymentStatus: 'Pending',
      month: parseInt(month),
      year: parseInt(year),
      isProrated,
      proratedDays,
      workingDaysInMonth,
      createdBy: req.user.id,
      createdByName: req.user.name,
      notes: notes || '',
      isActive: true
    });

    await salary.save();
    await updateCompanyFinancesForSalary(salary, 'create');
    await salary.populate('employee', 'name email role department');

    res.status(201).json({
      success: true,
      data: salary,
      prorated: isProrated ? {
        daysWorked: proratedDays,
        totalWorkingDays: workingDaysInMonth,
        percentage: ((proratedDays / workingDaysInMonth) * 100).toFixed(2) + '%'
      } : null
    });
  } catch (error) {
    console.error('Create salary error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// PROCESS SALARY PAYMENT (FIXED)
// ============================================
const processSalaryPayment = async (req, res) => {
  try {
    const { amount, method, reference, notes } = req.body;
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      });
    }

    if (salary.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This salary is already fully paid'
      });
    }

    // Calculate advance deduction
    let advanceDeduction = 0;
    let finalSalary = salary.totalSalary;

    if (salary.advanceRemaining > 0) {
      advanceDeduction = Math.min(salary.advanceDeductionPerMonth, salary.advanceRemaining);
      finalSalary = salary.totalSalary - advanceDeduction;
    }

    const paymentAmount = parseFloat(amount) || finalSalary;
    const actualPayment = Math.min(paymentAmount, finalSalary - salary.paidAmount);

    salary.paidAmount += actualPayment;
    salary.dueAmount = finalSalary - salary.paidAmount;

    if (salary.advanceRemaining > 0) {
      salary.advanceRemaining = Math.max(0, salary.advanceRemaining - advanceDeduction);
      if (salary.advanceRemaining === 0) {
        salary.advanceStatus = 'Cleared';
      }
    }

    if (salary.paidAmount >= finalSalary) {
      salary.paymentStatus = 'Paid';
    } else if (salary.paidAmount > 0) {
      salary.paymentStatus = 'Partial';
    }

    salary.paymentHistory.push({
      amount: actualPayment,
      method: method || 'Cash',
      reference: reference || '',
      date: new Date(),
      paidBy: req.user.id,
      paidByName: req.user.name,
      notes: notes || ''
    });

    await salary.save();
    await updateCompanyFinancesForSalary(salary, 'payment', actualPayment);
    await salary.populate('employee', 'name email role department');

    res.status(200).json({
      success: true,
      data: salary,
      advanceDeduction: advanceDeduction,
      finalSalary: finalSalary
    });
  } catch (error) {
    console.error('Process salary payment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// GET ALL SALARIES
// ============================================
const getSalaries = async (req, res) => {
  try {
    const { employee, month, year, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (employee) query.employee = employee;
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.paymentStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const salaries = await Salary.find(query)
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('employee', 'name email role department profilePicture')
      .populate('createdBy', 'name');

    const total = await Salary.countDocuments(query);

    const summary = await Salary.aggregate([
      { $match: query },
      { $group: {
        _id: null,
        totalBase: { $sum: '$basicSalary' },
        totalBonus: { $sum: '$bonus' },
        totalPaid: { $sum: '$paidAmount' },
        totalDue: { $sum: '$dueAmount' },
        totalAdvance: { $sum: '$advanceSalary' },
        advanceRemaining: { $sum: '$advanceRemaining' }
      }}
    ]);

    res.status(200).json({
      success: true,
      count: salaries.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: salaries,
      summary: summary[0] || { 
        totalBase: 0, 
        totalBonus: 0, 
        totalPaid: 0, 
        totalDue: 0,
        totalAdvance: 0,
        advanceRemaining: 0
      }
    });
  } catch (error) {
    console.error('Get salaries error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// GET SALARY STATS
// ============================================
const getSalaryStats = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const stats = await Salary.aggregate([
      { $facet: {
        pending: [
          { $match: { paymentStatus: 'Pending' } },
          { $group: {
            _id: null,
            total: { $sum: '$dueAmount' },
            count: { $sum: 1 }
          }}
        ],
        monthly: [
          { $match: { month: currentMonth, year: currentYear } },
          { $group: {
            _id: null,
            total: { $sum: '$totalSalary' },
            paid: { $sum: '$paidAmount' },
            due: { $sum: '$dueAmount' },
            count: { $sum: 1 },
            advanceTotal: { $sum: '$advanceSalary' },
            advanceRemaining: { $sum: '$advanceRemaining' }
          }}
        ],
        byRole: [
          { $group: {
            _id: '$employeeRole',
            total: { $sum: '$totalSalary' },
            paid: { $sum: '$paidAmount' },
            due: { $sum: '$dueAmount' },
            count: { $sum: 1 }
          }}
        ],
        totalAllTime: [
          { $group: {
            _id: null,
            totalPaid: { $sum: '$paidAmount' },
            totalDue: { $sum: '$dueAmount' },
            totalAdvance: { $sum: '$advanceSalary' },
            advanceRemaining: { $sum: '$advanceRemaining' }
          }}
        ]
      }}
    ]);

    const result = stats[0];
    const pending = result.pending[0] || { total: 0, count: 0 };
    const monthly = result.monthly[0] || { total: 0, paid: 0, due: 0, count: 0, advanceTotal: 0, advanceRemaining: 0 };
    const totalAllTime = result.totalAllTime[0] || { totalPaid: 0, totalDue: 0, totalAdvance: 0, advanceRemaining: 0 };

    res.status(200).json({
      success: true,
      data: {
        pending: {
          count: pending.count,
          amount: pending.total
        },
        monthly: {
          total: monthly.total,
          paid: monthly.paid,
          due: monthly.due,
          count: monthly.count,
          advanceTotal: monthly.advanceTotal,
          advanceRemaining: monthly.advanceRemaining
        },
        byRole: result.byRole,
        total: {
          paid: totalAllTime.totalPaid,
          due: totalAllTime.totalDue,
          advanceGiven: totalAllTime.totalAdvance,
          advanceRemaining: totalAllTime.advanceRemaining
        }
      }
    });
  } catch (error) {
    console.error('Get salary stats error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSalary,
  requestAdvanceSalary,
  processSalaryPayment,
  autoGenerateSalaries,
  getSalaries,
  getSalaryStats
};