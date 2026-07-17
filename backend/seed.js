const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Super Admin Data
const superAdminData = {
  name: 'Ramanand Mandal',
  email: 'ramanand@riseuptech.com.np',
  password: 'Roshy//@001//',
  phone: '9829704557',
  dateOfBirth: new Date('2006-04-18'),
  role: 'super_admin',
  department: 'Executive',
  isActive: true,
  gender: 'male',
  maritalStatus: 'single',
  nationality: 'Nepalese',
  about: 'Founder & CEO of RiseUp Tech Software Company.',
  address: {
    street: 'Kathmandu',
    city: 'Kathmandu',
    state: 'Bagmati',
    country: 'Nepal',
    zipCode: '44600'
  }
};

// ============================================
// FIXED: Force create super admin with direct bcrypt
// ============================================
const forceCreateSuperAdmin = async () => {
  try {
    console.log('\n🔧 Force creating Super Admin...');
    
    // Delete any existing super admin with this email
    await User.deleteMany({ email: superAdminData.email });
    await User.deleteMany({ role: 'super_admin' });
    console.log('🗑️  Removed existing super admin(s)');

    // Directly hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(superAdminData.password, salt);
    
    console.log('🔑 Password hashed successfully');
    console.log(`📝 Hash: ${hashedPassword.substring(0, 30)}...`);

    // Create user with hashed password
    const userData = {
      ...superAdminData,
      password: hashedPassword
    };

    const admin = new User(userData);
    await admin.save();

    console.log('\n✅ Super Admin created successfully!');
    
    // Verify the password immediately
    const isMatch = await bcrypt.compare(superAdminData.password, admin.password);
    console.log(`\n🔐 Password verification: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (!isMatch) {
      console.log('⚠️  Password verification failed! Trying direct update...');
      
      // Direct update using updateOne with raw bcrypt
      const newHash = await bcrypt.hash(superAdminData.password, 10);
      await User.updateOne(
        { _id: admin._id },
        { $set: { password: newHash } }
      );
      
      console.log('🔄 Password updated directly in database');
      
      // Verify again
      const updatedAdmin = await User.findById(admin._id).select('+password');
      const retryMatch = await bcrypt.compare(superAdminData.password, updatedAdmin.password);
      console.log(`✅ Retry verification: ${retryMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    }

    // Display admin info
    const finalAdmin = await User.findById(admin._id).select('+password');
    console.log('\n📋 Super Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Name: ${finalAdmin.name}`);
    console.log(`📧 Email: ${finalAdmin.email}`);
    console.log(`🆔 Role: ${finalAdmin.role}`);
    console.log(`🔑 Employee ID: ${finalAdmin.employeeId || 'N/A'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🔐 Login Credentials:');
    console.log(`📧 Email: ${finalAdmin.email}`);
    console.log(`🔑 Password: Roshy//@001//`);
    console.log('\n⚠️  Please change the password after first login!');
    
    return finalAdmin;
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    throw error;
  }
};

// ============================================
// Fix existing super admin password
// ============================================
const fixPassword = async () => {
  try {
    console.log('\n🔧 Fixing Super Admin Password...');
    
    const admin = await User.findOne({ email: superAdminData.email }).select('+password');
    
    if (!admin) {
      console.log('❌ No super admin found with email:', superAdminData.email);
      return;
    }

    // Directly update password using updateOne
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(superAdminData.password, salt);
    
    await User.updateOne(
      { _id: admin._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('✅ Password updated successfully');
    
    // Verify
    const updatedAdmin = await User.findById(admin._id).select('+password');
    const isMatch = await bcrypt.compare(superAdminData.password, updatedAdmin.password);
    console.log(`🔐 Verification: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (isMatch) {
      console.log('\n✅ You can now login with:');
      console.log(`📧 Email: ${superAdminData.email}`);
      console.log(`🔑 Password: Roshy//@001//`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing password:', error.message);
  }
};

// ============================================
// Verify super admin
// ============================================
const verifySuperAdmin = async () => {
  try {
    console.log('\n🔍 Verifying Super Admin...');
    
    const admin = await User.findOne({ email: superAdminData.email }).select('+password');
    
    if (!admin) {
      console.log('❌ No super admin found!');
      return;
    }

    console.log('✅ Super Admin found:');
    console.log(`👤 Name: ${admin.name}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🆔 Role: ${admin.role}`);
    console.log(`🔑 Employee ID: ${admin.employeeId || 'N/A'}`);
    
    // Test password
    const isMatch = await bcrypt.compare(superAdminData.password, admin.password);
    console.log(`\n🔐 Password: ${isMatch ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isMatch) {
      console.log('\n⚠️  Password is invalid. Run: node seed.js fix');
    } else {
      console.log('\n✅ Super admin is ready to login!');
      console.log(`📧 Email: ${superAdminData.email}`);
      console.log(`🔑 Password: Roshy//@001//`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying super admin:', error.message);
  }
};

// ============================================
// Reset super admin (delete and recreate)
// ============================================
const resetSuperAdmin = async () => {
  try {
    console.log('\n🔄 Resetting Super Admin...');
    
    // Delete all super admins
    const result = await User.deleteMany({ 
      $or: [
        { email: superAdminData.email },
        { role: 'super_admin' }
      ]
    });
    console.log(`🗑️  Removed ${result.deletedCount} super admin(s)`);
    
    // Force create new one
    await forceCreateSuperAdmin();
    
  } catch (error) {
    console.error('❌ Error resetting super admin:', error.message);
  }
};

// ============================================
// Main execution
// ============================================
const main = async () => {
  try {
    console.log('🚀 Super Admin Management Tool\n');
    
    await connectDB();
    
    const args = process.argv.slice(2);
    const command = args[0] || 'create';
    
    switch (command) {
      case 'create':
      case 'force':
        await forceCreateSuperAdmin();
        break;
      case 'fix':
        await fixPassword();
        break;
      case 'verify':
        await verifySuperAdmin();
        break;
      case 'reset':
        await resetSuperAdmin();
        break;
      default:
        console.log('❌ Unknown command. Available commands:');
        console.log('  node seed.js create  - Force create super admin');
        console.log('  node seed.js fix     - Fix existing super admin password');
        console.log('  node seed.js verify  - Verify super admin exists');
        console.log('  node seed.js reset   - Reset super admin (delete and recreate)');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Operation completed.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

main();