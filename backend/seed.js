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
  about: 'Founder & CEO of RiseUp Tech Software Company. Passionate about technology and innovation.',
  address: {
    street: 'Kathmandu',
    city: 'Kathmandu',
    state: 'Bagmati',
    country: 'Nepal',
    zipCode: '44600'
  },
  emergencyContact: {
    name: 'Emergency Contact',
    relationship: 'Family',
    phone: '9829704557'
  },
  socialMedia: {
    linkedin: 'https://linkedin.com/in/ramanand-mandal',
    github: 'https://github.com/ramanand-mandal',
    twitter: 'https://twitter.com/ramanand-mandal'
  },
  skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'Cloud Computing', 'Leadership'],
  hobbies: ['Coding', 'Reading', 'Innovation', 'Technology', 'Entrepreneurship']
};

// Hash password function (matching the User model's method)
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Create Super Admin
const createSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: superAdminData.email },
        { role: 'super_admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️ Super Admin already exists:');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Name: ${existingAdmin.name}`);
      console.log(`🆔 Role: ${existingAdmin.role}`);
      
      // Ask user if they want to update
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('\nDo you want to update the existing super admin? (y/n): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() === 'y') {
        // Hash the password before updating
        const hashedPassword = await hashPassword(superAdminData.password);
        
        // Update existing super admin
        const updatedAdmin = await User.findByIdAndUpdate(
          existingAdmin._id,
          {
            ...superAdminData,
            password: hashedPassword
          },
          { new: true, runValidators: true }
        );
        
        console.log('\n✅ Super Admin updated successfully!');
        displayAdminInfo(updatedAdmin);
        
        // Test the password
        await testPassword(updatedAdmin);
        return updatedAdmin;
      } else {
        console.log('\n❌ Operation cancelled. No changes made.');
        return null;
      }
    }

    // Hash the password before creating
    const hashedPassword = await hashPassword(superAdminData.password);
    
    // Create new super admin with hashed password
    const admin = new User({
      ...superAdminData,
      password: hashedPassword
    });
    
    await admin.save();
    
    console.log('\n✅ Super Admin created successfully!');
    displayAdminInfo(admin);
    
    // Test the password
    await testPassword(admin);
    
    return admin;
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    throw error;
  }
};

// Test password function
const testPassword = async (admin) => {
  try {
    console.log('\n🔐 Testing Password...');
    const testPassword = 'Roshy//@001//';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log(`✅ Password match: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    
    if (!isMatch) {
      console.log('⚠️  Password verification failed! Please check the password.');
    }
  } catch (error) {
    console.error('❌ Password test error:', error.message);
  }
};

// Display Admin Information
const displayAdminInfo = (admin) => {
  console.log('\n📋 Super Admin Details:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 Name: ${admin.name}`);
  console.log(`📧 Email: ${admin.email}`);
  console.log(`🆔 Role: ${admin.role}`);
  console.log(`📱 Phone: ${admin.phone}`);
  console.log(`🎂 Date of Birth: ${admin.dateOfBirth ? admin.dateOfBirth.toLocaleDateString() : 'Not set'}`);
  console.log(`🏢 Department: ${admin.department}`);
  console.log(`🌍 Nationality: ${admin.nationality}`);
  console.log(`📅 Joined: ${admin.createdAt ? admin.createdAt.toLocaleDateString() : 'Not set'}`);
  console.log(`🔑 Employee ID: ${admin.employeeId || 'Not generated'}`);
  console.log(`📧 Email: ${admin.email}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n🔐 Login Credentials:');
  console.log(`📧 Email: ${admin.email}`);
  console.log(`🔑 Password: Roshy//@001//`);
  console.log('\n⚠️  Please change the password after first login!');
};

// Verify Super Admin
const verifySuperAdmin = async () => {
  try {
    const admin = await User.findOne({ role: 'super_admin' }).select('+password');
    
    if (!admin) {
      console.log('❌ No super admin found in the database.');
      return;
    }

    console.log('\n🔍 Super Admin Verification:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Super Admin exists in database`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🆔 Role: ${admin.role}`);
    console.log(`📱 Phone: ${admin.phone}`);
    console.log(`📅 Created: ${admin.createdAt ? admin.createdAt.toLocaleDateString() : 'Not set'}`);
    console.log(`🔑 Employee ID: ${admin.employeeId || 'Not generated'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test password verification
    console.log('\n🔐 Testing Password...');
    const testPassword = 'Roshy//@001//';
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
    console.log(`✅ Password Match: ${isPasswordValid ? 'VALID ✅' : 'INVALID ❌'}`);
    
    if (isPasswordValid) {
      console.log('✅ Super admin credentials are valid! You can login now.');
    } else {
      console.log('❌ Password verification failed! Please recreate the super admin.');
      console.log('Run: npm run seed:create');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error verifying super admin:', error.message);
  }
};

// Delete Super Admin
const deleteSuperAdmin = async () => {
  try {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('\n⚠️  Are you sure you want to delete all super admins? (y/n): ', resolve);
    });
    readline.close();

    if (answer.toLowerCase() === 'y') {
      const result = await User.deleteMany({ role: 'super_admin' });
      console.log(`✅ Deleted ${result.deletedCount} super admin(s)`);
    } else {
      console.log('❌ Operation cancelled.');
    }
  } catch (error) {
    console.error('❌ Error deleting super admin:', error.message);
  }
};

// Fix Existing Super Admin
const fixExistingSuperAdmin = async () => {
  try {
    console.log('\n🔧 Attempting to fix existing super admin...');
    
    const admin = await User.findOne({ role: 'super_admin' });
    
    if (!admin) {
      console.log('❌ No super admin found to fix.');
      return;
    }

    // Re-hash the password
    const hashedPassword = await hashPassword('Roshy//@001//');
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('✅ Super admin password fixed!');
    
    // Test the new password
    await testPassword(admin);
    
  } catch (error) {
    console.error('❌ Error fixing super admin:', error.message);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Initializing Super Admin Setup...\n');
    
    // Connect to database
    await connectDB();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'create';
    
    switch (command) {
      case 'create':
        await createSuperAdmin();
        break;
      case 'verify':
        await verifySuperAdmin();
        break;
      case 'delete':
        await deleteSuperAdmin();
        break;
      case 'fix':
        await fixExistingSuperAdmin();
        break;
      default:
        console.log('❌ Unknown command. Available commands:');
        console.log('  npm run seed:create  - Create super admin');
        console.log('  npm run seed:verify  - Verify super admin exists');
        console.log('  npm run seed:delete  - Delete super admin');
        console.log('  npm run seed:fix     - Fix existing super admin password');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Operation completed. Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
main();