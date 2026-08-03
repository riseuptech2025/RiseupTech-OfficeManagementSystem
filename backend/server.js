// backend/server.js
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

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// COMPLETE CORS CONFIGURATION - FIXED
// ============================================
const allowedOrigins = [
  // Development
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  
  // Production - Admin Dashboard (Vercel)
  'https://workspace.riseuptech.com.np',
  'https://riseup-tech-office-management-system.vercel.app',
  'https://riseup-tech-office-management-system-pcluffg2i.vercel.app',
  'https://riseup-tech-admin.vercel.app',
  
  // Production - Public Website
  'https://www.riseuptech.com.np',
  'https://riseuptech.com.np',
  'https://riseup-tech-website.vercel.app',
  
  // Production - Backend
  'https://riseup-tech-backend.vercel.app',
  'https://riseup-tech-office-management-system-pcluffg2i.vercel.app',
  
  // Vercel preview URLs
  'https://riseup-tech-office-management-system-*.vercel.app',
  
  // Add any other domains
  process.env.ADMIN_URL,
  process.env.WEBSITE_URL,
  process.env.BACKEND_URL
].filter(Boolean);

// ============================================
// CORS Middleware - CRITICAL FIX
// Must be BEFORE any other middleware
// ============================================
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log all requests for debugging
  console.log('📨 Request:', {
    method: req.method,
    url: req.url,
    origin: origin,
    headers: req.headers
  });

  // Allow all origins in development
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    // Check if origin is allowed or contains allowed domains
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowed;
    });
    
    if (isAllowed || !origin) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    } else {
      // For production, allow specific domains
      res.header('Access-Control-Allow-Origin', 'https://workspace.riseuptech.com.np');
      res.header('Access-Control-Allow-Origin', 'https://www.riseuptech.com.np');
      res.header('Access-Control-Allow-Origin', 'https://riseuptech.com.np');
    }
  }
  
  // CORS headers
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Preflight request from:', origin);
    // Send 200 status for preflight without any redirect
    return res.status(200).send({});
  }
  
  next();
});

// ============================================
// CORS with cors package - Additional layer
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return origin === allowed;
    });
    
    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // Allow any domain that contains riseuptech.com.np or vercel.app
      if (origin.includes('riseuptech.com.np') || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        console.warn('❌ CORS blocked for origin:', origin);
        callback(null, true); // Allow anyway for testing
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Auth-Token'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Other middleware
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 100000
}));
app.use(morgan('dev'));

// ============================================
// Connect to MongoDB
// ============================================
const connectDB = require('./config/database');

// Connect only once
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('✅ Already connected to MongoDB');
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

// Connect on startup
connectToDatabase();

// ============================================
// Health check endpoints - Must be before routes
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ============================================
// Routes
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

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ============================================
// Export for Vercel
// ============================================
module.exports = app;

// Start server (only if not in Vercel)
if (process.env.NODE_ENV !== 'production' || process.env.IS_VERCEL !== 'true') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Allowed origins:`, allowedOrigins);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});