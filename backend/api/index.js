// api/index.js
const app = require('../server');

// Vercel serverless handler
module.exports = async (req, res) => {
  console.log(`📨 Request: ${req.method} ${req.url}`);
  console.log(`🔗 Origin: ${req.headers.origin}`);
  
  try {
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('❌ Handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};