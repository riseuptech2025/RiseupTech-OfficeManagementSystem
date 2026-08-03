// api/index.js
const app = require('../server');
const { connectDB, isConnected } = require('../config/database');

// Global connection promise
let connectionPromise = null;

// Vercel serverless handler
module.exports = async (req, res) => {
  console.log(`📨 Request: ${req.method} ${req.url}`);
  
  try {
    // Ensure database is connected
    if (!isConnected()) {
      console.log('🔄 Database not connected, connecting...');
      if (!connectionPromise) {
        connectionPromise = connectDB();
      }
      await connectionPromise;
      console.log('✅ Database connected for request');
    }
    
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('❌ Handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};