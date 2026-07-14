import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaArrowRight,
  FaShieldAlt,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaCode,
  FaServer,
  FaCloud,
  FaMicrochip,
  FaNetworkWired,
  FaBrain,
  FaRocket
} from 'react-icons/fa';
import { authService } from '../services/api';
import CompanyLogo from '../components/CompanyLogo';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Tech icons for floating particles
  const techIcons = [
    { Icon: FaCode, color: '#00D4FF', delay: 0 },
    { Icon: FaServer, color: '#7C3AED', delay: 1.5 },
    { Icon: FaCloud, color: '#06D6A0', delay: 3 },
    { Icon: FaMicrochip, color: '#FF6B6B', delay: 0.5 },
    { Icon: FaNetworkWired, color: '#F59E0B', delay: 2 },
    { Icon: FaBrain, color: '#EC4899', delay: 1 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 14, stiffness: 120 },
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tech-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(0, 212, 255, 0.03)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="rgba(0, 212, 255, 0.05)" />
            </pattern>
            <linearGradient id="gradient-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06D6A0" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-grid)" />
        </svg>
      </div>

      {/* Animated tech particles */}
      {techIcons.map((tech, index) => (
        <motion.div
          key={index}
          className="absolute opacity-10"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
            color: tech.color,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, -20, 10, 0],
            rotate: [0, 180, 360],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            delay: tech.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <tech.Icon className="w-12 h-12" />
        </motion.div>
      ))}

      {/* Animated circuit lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <path d="M0,200 Q100,100 200,200 T400,200 T600,200" stroke="#00D4FF" strokeWidth="0.5" fill="none">
            <animate attributeName="d" dur="20s" repeatCount="indefinite" 
              values="M0,200 Q100,100 200,200 T400,200 T600,200;
                      M0,200 Q100,300 200,200 T400,200 T600,200;
                      M0,200 Q100,100 200,200 T400,200 T600,200" />
          </path>
          <path d="M0,400 Q150,500 300,400 T500,400 T700,400" stroke="#7C3AED" strokeWidth="0.5" fill="none">
            <animate attributeName="d" dur="25s" repeatCount="indefinite" 
              values="M0,400 Q150,500 300,400 T500,400 T700,400;
                      M0,400 Q150,300 300,400 T500,400 T700,400;
                      M0,400 Q150,500 300,400 T500,400 T700,400" />
          </path>
          <path d="M0,600 Q200,700 400,600 T600,600 T800,600" stroke="#06D6A0" strokeWidth="0.5" fill="none">
            <animate attributeName="d" dur="18s" repeatCount="indefinite" 
              values="M0,600 Q200,700 400,600 T600,600 T800,600;
                      M0,600 Q200,500 400,600 T600,600 T800,600;
                      M0,600 Q200,700 400,600 T600,600 T800,600" />
          </path>
        </svg>
      </div>

      {/* Interactive glow follow mouse */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(124,58,237,0.1) 50%, transparent 100%)',
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', damping: 20 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#111118]/80 backdrop-blur-2xl rounded-3xl p-6 border border-[#00D4FF]/20 shadow-2xl shadow-[#00D4FF]/5"
        >
          {/* Tech status bar */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between mb-6 px-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-[#00D4FF] font-mono tracking-wider">● SYSTEM ONLINE</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-[#00D4FF]/30 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#7C3AED]/30 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#06D6A0]/30 rounded-full"></div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] backdrop-blur-sm rounded-2xl p-8 border border-[#00D4FF]/10 shadow-inner"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', damping: 12 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <CompanyLogo size="large" showText={true} textColor="text-[#00D4FF]" />
                  <div className="absolute -inset-4 bg-[#00D4FF]/5 blur-xl rounded-full"></div>
                </div>
              </motion.div>
              <motion.h2
                className="text-3xl font-bold text-white mt-4 tracking-tight"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Access Portal
              </motion.h2>
              <motion.p
                className="text-gray-400 mt-1 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Secure authentication required
              </motion.p>
              <motion.div
                className="mt-3 flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <span className="inline-flex items-center gap-2 bg-[#00D4FF]/10 text-[#00D4FF] text-xs px-4 py-1.5 rounded-full font-mono border border-[#00D4FF]/20 backdrop-blur-sm">
                  <FaShieldAlt className="w-3 h-3" />
                  ENCRYPTED CONNECTION
                </span>
              </motion.div>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 flex items-start gap-2 overflow-hidden backdrop-blur-sm"
                >
                  <FaExclamationCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
                  <div>
                    <span className="font-medium block text-xs">AUTHENTICATION ERROR</span>
                    <span className="text-sm">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-mono text-gray-400 mb-2 tracking-wider">
                  EMPLOYEE EMAIL
                </label>
                <div className={`relative group transition-all duration-300 ${
                  focusedField === 'email' ? 'scale-[1.02]' : ''
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className={`h-5 w-5 transition-colors ${
                      focusedField === 'email' ? 'text-[#00D4FF]' : 'text-gray-600'
                    }`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0A0F]/80 text-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition-all duration-300 placeholder:text-gray-600 border-gray-800/50 focus:border-[#00D4FF] font-mono"
                    placeholder="employee@riseup.tech"
                  />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none border-2 transition-all duration-300 ${
                    focusedField === 'email' ? 'border-[#00D4FF]/30 scale-105' : 'border-transparent'
                  }`}></div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-xs font-mono text-gray-400 mb-2 tracking-wider">
                  ACCESS KEY
                </label>
                <div className={`relative group transition-all duration-300 ${
                  focusedField === 'password' ? 'scale-[1.02]' : ''
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 transition-colors ${
                      focusedField === 'password' ? 'text-[#00D4FF]' : 'text-gray-600'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    minLength="6"
                    className="w-full pl-10 pr-12 py-3 bg-[#0A0A0F]/80 text-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent transition-all duration-300 placeholder:text-gray-600 border-gray-800/50 focus:border-[#00D4FF] font-mono"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#00D4FF] transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                  <div className={`absolute inset-0 rounded-xl pointer-events-none border-2 transition-all duration-300 ${
                    focusedField === 'password' ? 'border-[#00D4FF]/30 scale-105' : 'border-transparent'
                  }`}></div>
                </div>
                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-gray-500 font-mono">MIN 6 CHARACTERS</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white py-3.5 rounded-xl hover:shadow-lg hover:shadow-[#00D4FF]/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 focus:ring-offset-[#0A0A0F] disabled:opacity-50 transition-all duration-300 font-medium text-base relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <FaSpinner className="h-5 w-5 animate-spin" />
                        <span className="font-mono">AUTHENTICATING...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono">ACCESS SYSTEM</span>
                        <FaRocket className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                </motion.button>
              </motion.div>
            </form>

            <motion.div
              variants={itemVariants}
              className="mt-6 pt-6 border-t border-gray-800/50"
            >
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <FaCheckCircle className="text-[#00D4FF] w-3 h-3" />
                  <span className="font-mono">SECURE PRIVATE PLATFORM — AUTHORIZED ACCESS ONLY</span>
                </div>
                <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600 font-mono">
                  <span>v3.2.1</span>
                  <span>•</span>
                  <span>© 2024 Riseup-Tech</span>
                  <span>•</span>
                  <span>AES-256</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;