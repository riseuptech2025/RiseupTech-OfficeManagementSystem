// config/database.js
const mongoose = require('mongoose');

// Cache the connection globally for serverless environment
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Use cached connection if available
  if (cached.conn) {
    console.log('✅ Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    // ============================================
    // Connection options - IMPORTANT: bufferCommands is true by default
    // ============================================
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      // bufferCommands: true - this is the default, allows queuing
      // Do NOT set bufferCommands: false
    };

    console.log('🔄 Connecting to MongoDB...');
    console.log('📡 MongoDB URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected successfully');
        console.log(`📊 Connection state: ${mongoose.connection.readyState}`);
        console.log(`📊 Database Name: ${mongoose.connection.db.databaseName}`);
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

// Helper to check connection state
const getConnectionState = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = mongoose.connection.readyState;
  return states[state] || 'unknown';
};

// Helper to check if connected
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, getConnectionState, isConnected };