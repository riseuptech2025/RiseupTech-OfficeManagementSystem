// models/CompanyFinance.js
const mongoose = require('mongoose');

const companyFinanceSchema = new mongoose.Schema({
  // ============================================
  // SHARE DETAILS - FIXED
  // ============================================
  totalShares: {
    type: Number,
    default: 1000
  },
  sharePrice: {
    type: Number,
    default: 15
  },
  totalShareValue: {
    type: Number,
    default: 15000
  },
  initialInvestment: {
    type: Number,
    default: 15000
  },
  initialSharePrice: {
    type: Number,
    default: 15
  },
  
  // ============================================
  // SHAREHOLDERS - FIXED
  // ============================================
  shareholders: [{
    name: {
      type: String,
      required: true
    },
    shares: {
      type: Number,
      required: true,
      min: 0
    },
    investment: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // ============================================
  // FINANCIAL TRACKING
  // ============================================
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  totalExpenses: {
    type: Number,
    default: 0,
    min: 0
  },
  totalExpenditure: {
    type: Number,
    default: 0,
    min: 0
  },
  netProfit: {
    type: Number,
    default: 0
  },
  companyValue: {
    type: Number,
    default: 15000
  },
  
  // ============================================
  // EXPENDITURE BREAKDOWN
  // ============================================
  expenditureBreakdown: {
    'Office Rent': { type: Number, default: 0 },
    'Utilities': { type: Number, default: 0 },
    'Salaries': { type: Number, default: 0 },
    'Equipment': { type: Number, default: 0 },
    'Software Licenses': { type: Number, default: 0 },
    'Marketing': { type: Number, default: 0 },
    'Travel': { type: Number, default: 0 },
    'Food & Beverage': { type: Number, default: 0 },
    'Stationery': { type: Number, default: 0 },
    'Maintenance': { type: Number, default: 0 },
    'Insurance': { type: Number, default: 0 },
    'Taxes': { type: Number, default: 0 },
    'Training': { type: Number, default: 0 },
    'Miscellaneous': { type: Number, default: 0 }
  },
  
  // ============================================
  // MONTHLY REPORTS
  // ============================================
  monthlyReports: [{
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    earnings: {
      type: Number,
      default: 0
    },
    expenses: {
      type: Number,
      default: 0
    },
    expenditure: {
      type: Number,
      default: 0
    },
    profit: {
      type: Number,
      default: 0
    },
    salaryExpenses: {
      type: Number,
      default: 0
    },
    otherExpenses: {
      type: Number,
      default: 0
    },
    shareDividend: {
      type: Number,
      default: 0
    },
    sharePrice: {
      type: Number,
      default: 15
    },
    companyValue: {
      type: Number,
      default: 15000
    }
  }],
  
  // ============================================
  // TRANSACTION LOG
  // ============================================
  transactions: [{
    type: {
      type: String,
      enum: ['Income', 'Expense', 'Salary', 'Dividend', 'Investment', 'Expenditure'],
      required: true
    },
    category: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    reference: String,
    relatedTo: {
      model: {
        type: String,
        enum: ['User', 'Receipt', 'Salary', 'Customer', 'Expenditure']
      },
      id: {
        type: mongoose.Schema.Types.ObjectId
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdByName: {
      type: String
    }
  }],
  
  // ============================================
  // METADATA
  // ============================================
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ============================================
// CALCULATE SHARE VALUES AND COMPANY VALUE
// ============================================
companyFinanceSchema.statics.calculateShareValues = function(finance) {
  const totalShares = finance.totalShares || 1000;
  const initialInvestment = finance.initialInvestment || 15000;
  const initialSharePrice = finance.initialSharePrice || 15;
  
  // Calculate net profit
  const netProfit = (finance.totalEarnings || 0) - (finance.totalExpenses || 0) - (finance.totalExpenditure || 0);
  finance.netProfit = netProfit;
  
  // Company Value = Net Profit + Initial Investment
  finance.companyValue = netProfit + initialInvestment;
  
  // Share Price = Company Value / Total Shares
  finance.sharePrice = finance.companyValue / totalShares;
  finance.totalShareValue = finance.companyValue;
  
  // Calculate shareholder values
  finance.shareholders.forEach(shareholder => {
    shareholder.percentage = (shareholder.shares / totalShares) * 100;
    shareholder.investment = shareholder.shares * (initialInvestment / totalShares);
  });
  
  return finance;
};

// ============================================
// UPDATE COMPANY FINANCES
// ============================================
companyFinanceSchema.statics.updateFinances = async function(earnings = 0, expenses = 0, expenditure = 0) {
  let finance = await this.findOne();
  if (!finance) {
    finance = new this({
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
      companyValue: 15000
    });
  }
  
  // Update earnings and expenses
  if (earnings > 0) {
    finance.totalEarnings += earnings;
  }
  if (expenses > 0) {
    finance.totalExpenses += expenses;
  }
  if (expenditure > 0) {
    finance.totalExpenditure += expenditure;
  }
  
  // Recalculate all values
  finance = this.calculateShareValues(finance);
  await finance.save();
  return finance;
};

module.exports = mongoose.model('CompanyFinance', companyFinanceSchema);