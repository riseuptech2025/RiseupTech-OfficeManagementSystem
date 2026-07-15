// seed/companyFinanceSeed.js
const mongoose = require('mongoose');
const CompanyFinance = require('./models/CompanyFinance');

require('dotenv').config();

// ============================================
// COMPANY FINANCE SEED DATA
// ============================================
// Initial Investment: Rs. 15,000
// Total Shares: 1000
// Initial Share Price: Rs. 15 per share
// 
// Shareholders:
// 1. Ramanand Mandal: 550 shares (55%) - Investment: Rs. 8,250
// 2. Dipak Kumar Mandal Khatwe: 450 shares (45%) - Investment: Rs. 6,750
// ============================================

const seedCompanyFinance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing data
    await CompanyFinance.deleteMany({});
    console.log('🗑️  Removed existing company finance data');

    // Create new finance data
    const financeData = {
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
    };
    
    const finance = new CompanyFinance(financeData);
    await finance.save();
    
    console.log('\n✅ Company finance data seeded successfully!');
    console.log('\n===========================================');
    console.log('📊 COMPANY FINANCE SUMMARY');
    console.log('===========================================');
    console.log(`💰 Total Investment: Rs. 15,000`);
    console.log(`📈 Total Shares: 1,000`);
    console.log(`💵 Initial Share Price: Rs. 15.00`);
    console.log(`🏢 Company Value: Rs. ${finance.companyValue.toFixed(2)}`);
    console.log('\n👥 SHAREHOLDERS:');
    console.log('-------------------------------------------');
    finance.shareholders.forEach(s => {
      console.log(`  👤 ${s.name}:`);
      console.log(`     📊 Shares: ${s.shares}`);
      console.log(`     📈 Percentage: ${s.percentage.toFixed(1)}%`);
      console.log(`     💰 Investment: Rs. ${s.investment.toFixed(2)}`);
      console.log(`     💵 Share Value: Rs. ${(s.shares * finance.sharePrice).toFixed(2)}`);
      console.log('-------------------------------------------');
    });
    console.log('\n📊 SHARE PRICE CALCULATION:');
    console.log(`  Company Value: Rs. ${finance.companyValue.toFixed(2)}`);
    console.log(`  ÷ Total Shares: ${finance.totalShares}`);
    console.log(`  = Share Price: Rs. ${finance.sharePrice.toFixed(2)}`);
    console.log('\n===========================================');
    console.log('✅ Seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding company finance data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the seed function
seedCompanyFinance();