// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Import routes
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profile');
const leaveRoutes = require('./routes/leaveRoutes');
const reportRoutes = require('./routes/reportRoutes');
const taskRoutes = require('./routes/taskRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const customerRoutes = require('./routes/customerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const financeRoutes = require('./routes/financeRoutes');
const policyRoutes = require('./routes/policyRoutes');
const expenditureRoutes = require('./routes/expenditureRoutes');
const passwordManagerRoutes = require('./routes/passwordManagerRoutes');
const websiteRoutes = require('./routes/websiteRoutes');

// Import database connection
const { connectDB, getConnectionState, isConnected } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// CORS Configuration - Complete
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://192.168.18.249:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://www.riseuptech.com.np',
  'https://riseuptech.com.np',
  'https://workspace.riseuptech.com.np',
  'https://riseup-tech-office-management-syste.vercel.app',
  'https://*.vercel.app',
  process.env.FRONTEND_URL,
  process.env.SSO_FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('vercel.app')) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    console.warn('CORS blocked for origin:', origin);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// ============================================
// Security Middleware
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for Vercel
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// Database Connection Middleware
// ============================================
app.use(async (req, res, next) => {
  try {
    // Check connection state
    if (!isConnected()) {
      console.log(`🔄 Connecting to DB for: ${req.method} ${req.path}`);
      await connectDB();
      console.log(`✅ DB connected. State: ${mongoose.connection.readyState}`);
    }
    next();
  } catch (error) {
    console.error('❌ DB connection middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection error. Please try again.'
    });
  }
});

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', async (req, res) => {
  try {
    const state = getConnectionState();
    const connected = isConnected();
    res.status(200).json({
      status: connected ? 'OK' : 'Connecting',
      database: state,
      mongodb_uri: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      message: error.message 
    });
  }
});

// ============================================
// API Routes
// ============================================
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/passwords', passwordManagerRoutes);
app.use('/api/website', websiteRoutes);

// ============================================
// Error Handler
// ============================================
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ============================================
// For Vercel - Connect on startup
// ============================================
if (process.env.NODE_ENV === 'production') {
  // Connect when the serverless function starts
  connectDB().then(() => {
    console.log('✅ Database connected on server start');
  }).catch(err => {
    console.error('❌ Initial DB connection failed:', err);
  });
}

// ============================================
// Start server (local development)
// ============================================
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Database: ${getConnectionState()}`);
    });
  }).catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;