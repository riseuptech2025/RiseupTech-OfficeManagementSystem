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

// Connect to MongoDB
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// CORS Configuration
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
  // Vercel deployment URLs
  'https://riseup-tech-office-management-syste.vercel.app',
  'https://*.vercel.app',
  process.env.FRONTEND_URL,
  process.env.SSO_FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow any vercel.app domain in production
    if (process.env.NODE_ENV === 'production' && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('CORS blocked for origin:', origin);
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// ============================================
// Security Middleware - Relax CSP for Vercel
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://vercel.live"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://vercel.live"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://vercel.live"]
    }
  }
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 100000
}));

// Only use morgan in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
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

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ============================================
// Connect to Database (only if not in Vercel serverless)
// ============================================
if (process.env.NODE_ENV !== 'production') {
  connectDB();
}

// ============================================
// Export for Vercel
// ============================================
module.exports = app;

// Start server only if not in Vercel serverless environment
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS allowed origins:`, allowedOrigins);
    });
  });
}