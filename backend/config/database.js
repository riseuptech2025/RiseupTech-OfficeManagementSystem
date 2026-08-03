const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'riseup-tech', // optional: set database name explicitly
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📌 Host: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed');
    console.error(error.message);

    // Exit process with failure
    process.exit(1);
  }
};

// Connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

module.exports = connectDB;