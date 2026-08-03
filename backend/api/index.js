// api/index.js - Vercel serverless entry point
const app = require('../server');

// Connect to MongoDB for each request
const connectDB = require('../config/database');

// Handler for Vercel
module.exports = async (req, res) => {
  // Connect to database on first request
  if (!global.dbConnected) {
    try {
      await connectDB();
      global.dbConnected = true;
      console.log('✅ Database connected for Vercel request');
    } catch (error) {
      console.error('❌ Database connection error:', error);
    }
  }
  
  // Let Express handle the request
  return app(req, res);
};