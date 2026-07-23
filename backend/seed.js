// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
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
// DIRECT CREATE - Force create super admin
// ============================================
const forceCreateSuperAdmin = async () => {
  try {
    console.log('\n🔧 Force Creating Super Admin...\n');

    // 1. Delete any existing super admin with this email
    const deleted = await User.deleteMany({ 
      $or: [
        { email: superAdminData.email },
        { role: 'super_admin' }
      ]
    });
    console.log(`🗑️  Removed ${deleted.deletedCount} existing super admin(s)`);

    // 2. Hash the password using bcrypt directly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(superAdminData.password, salt);
    
    console.log('🔑 Password hashed successfully');

    // 3. Create user with hashed password
    const userData = {
      ...superAdminData,
      password: hashedPassword
    };

    const admin = new User(userData);
    await admin.save();

    console.log('\n✅ Super Admin created successfully!');
    
    // 4. Verify the password immediately
    const savedAdmin = await User.findOne({ email: superAdminData.email }).select('+password');
    const isMatch = await bcrypt.compare(superAdminData.password, savedAdmin.password);
    
    console.log(`\n🔐 Password verification: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (!isMatch) {
      console.log('⚠️  Password verification failed! Trying direct update...');
      
      // Direct update using updateOne
      const newHash = await bcrypt.hash(superAdminData.password, 10);
      await User.updateOne(
        { _id: savedAdmin._id },
        { $set: { password: newHash } }
      );
      
      // Verify again
      const updatedAdmin = await User.findById(savedAdmin._id).select('+password');
      const retryMatch = await bcrypt.compare(superAdminData.password, updatedAdmin.password);
      console.log(`✅ Retry verification: ${retryMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
    }

    // 5. Display admin info
    const finalAdmin = await User.findById(savedAdmin._id).select('+password');
    console.log('\n📋 Super Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Name: ${finalAdmin.name}`);
    console.log(`📧 Email: ${finalAdmin.email}`);
    console.log(`🆔 Role: ${finalAdmin.role}`);
    console.log(`📱 Phone: ${finalAdmin.phone}`);
    console.log(`🔑 Employee ID: ${finalAdmin.employeeId || 'N/A'}`);
    console.log(`📅 Created: ${finalAdmin.createdAt ? finalAdmin.createdAt.toLocaleDateString() : 'N/A'}`);
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
// FIX PASSWORD - Fix existing super admin password
// ============================================
const fixPassword = async () => {
  try {
    console.log('\n🔧 Fixing Super Admin Password...\n');
    
    const admin = await User.findOne({ email: superAdminData.email }).select('+password');
    
    if (!admin) {
      console.log('❌ No super admin found with email:', superAdminData.email);
      console.log('💡 Run: node seed.js create');
      return;
    }

    // Directly update password
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
    } else {
      console.log('\n❌ Still having issues. Try: node seed.js create');
    }
    
  } catch (error) {
    console.error('❌ Error fixing password:', error.message);
  }
};

// ============================================
// VERIFY - Check if super admin exists
// ============================================
const verifySuperAdmin = async () => {
  try {
    console.log('\n🔍 Verifying Super Admin...\n');
    
    const admin = await User.findOne({ email: superAdminData.email }).select('+password');
    
    if (!admin) {
      console.log('❌ No super admin found with email:', superAdminData.email);
      console.log('💡 Run: node seed.js create');
      return;
    }

    console.log('✅ Super Admin found:');
    console.log(`👤 Name: ${admin.name}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🆔 Role: ${admin.role}`);
    console.log(`🔑 Employee ID: ${admin.employeeId || 'N/A'}`);
    console.log(`📅 Created: ${admin.createdAt ? admin.createdAt.toLocaleDateString() : 'N/A'}`);
    
    // Test password
    const isMatch = await bcrypt.compare(superAdminData.password, admin.password);
    console.log(`\n🔐 Password: ${isMatch ? '✅ VALID' : '❌ INVALID'}`);
    
    if (isMatch) {
      console.log('\n✅ Super admin is ready to login!');
      console.log(`📧 Email: ${superAdminData.email}`);
      console.log(`🔑 Password: Roshy//@001//`);
    } else {
      console.log('\n⚠️  Password is invalid. Run: node seed.js fix');
    }
    
  } catch (error) {
    console.error('❌ Error verifying super admin:', error.message);
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
        await forceCreateSuperAdmin();
        break;
      case 'fix':
        await fixPassword();
        break;
      case 'verify':
        await verifySuperAdmin();
        break;
      default:
        console.log('❌ Unknown command. Available commands:');
        console.log('  node seed.js create  - Force create super admin');
        console.log('  node seed.js fix     - Fix existing super admin password');
        console.log('  node seed.js verify  - Verify super admin exists');
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