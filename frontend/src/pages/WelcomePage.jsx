import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRocket, 
  FaSpinner, 
  FaShieldAlt, 
  FaCheckCircle,
  FaCode,
  FaServer,
  FaCloud,
  FaMicrochip,
  FaNetworkWired,
  FaBrain,
  FaCog,
  FaArrowRight
} from 'react-icons/fa';
import { authService } from '../services/api';
import CompanyLogo from '../components/CompanyLogo';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hasNavigated = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use setTimeout to avoid rendering while navigating
          setTimeout(() => {
            if (!hasNavigated.current) {
              hasNavigated.current = true;
              if (authService.isAuthenticated()) {
                navigate('/home');
              } else {
                navigate('/login');
              }
            }
          }, 0);
          return 0;
        }
        return prev - 1;
      });
      setProgress((prev) => Math.min(prev + 33.33, 100));
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Tech icons for floating particles
  const techIcons = [
    { Icon: FaCode, color: '#00D4FF', delay: 0 },
    { Icon: FaServer, color: '#7C3AED', delay: 1.5 },
    { Icon: FaCloud, color: '#06D6A0', delay: 3 },
    { Icon: FaMicrochip, color: '#FF6B6B', delay: 0.5 },
    { Icon: FaNetworkWired, color: '#F59E0B', delay: 2 },
    { Icon: FaBrain, color: '#EC4899', delay: 1 },
    { Icon: FaCog, color: '#00D4FF', delay: 2.5 },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tech-grid-welcome" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(0, 212, 255, 0.03)" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.5" fill="rgba(0, 212, 255, 0.05)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-grid-welcome)" />
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring', damping: 20 }}
        className="relative z-10 w-full max-w-3xl px-4"
      >
        <div className="bg-[#111118]/80 backdrop-blur-2xl rounded-3xl p-8 border border-[#00D4FF]/20 shadow-2xl shadow-[#00D4FF]/5">
          {/* Tech status bar */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-8 px-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              </div>
              <span className="text-[10px] text-[#00D4FF] font-mono tracking-wider">● SYSTEM INITIALIZING</span>
            </div>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-[#00D4FF]/30 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#7C3AED]/30 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-[#06D6A0]/30 rounded-full"></div>
            </div>
          </motion.div>

          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] backdrop-blur-sm rounded-2xl p-12 border border-[#00D4FF]/10 shadow-inner">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', damping: 15 }}
              className="text-center"
            >
              {/* Company Logo with animation */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: 'spring', damping: 12 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <CompanyLogo size="xl" showText={true} textColor="text-[#00D4FF]" />
                  <div className="absolute -inset-6 bg-[#00D4FF]/5 blur-xl rounded-full"></div>
                </div>
              </motion.div>

              {/* Main welcome message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-[#00D4FF] font-mono text-sm tracking-wider">
                  SECURE ACCESS GRANTED
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <FaShieldAlt className="text-[#06D6A0] w-4 h-4" />
                  <span className="text-gray-400 text-sm">Authentication Verified</span>
                  <FaCheckCircle className="text-[#06D6A0] w-4 h-4" />
                </div>
              </motion.div>

              {/* Countdown and progress */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="max-w-md mx-auto"
              >
                <div className="bg-[#0A0A0F]/80 rounded-xl p-6 border border-[#00D4FF]/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-mono">INITIALIZING SYSTEM</span>
                    <span className="text-[#00D4FF] font-mono text-sm">
                      {countdown > 0 ? `${countdown}s` : 'READY'}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Status indicators */}
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      {countdown > 0 ? (
                        <>
                          <FaSpinner className="text-[#00D4FF] w-4 h-4 animate-spin" />
                          <span className="text-gray-400 text-xs font-mono">
                            Loading...
                          </span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="text-[#06D6A0] w-4 h-4" />
                          <span className="text-[#06D6A0] text-xs font-mono">
                            Complete
                          </span>
                        </>
                      )}
                    </div>
                    <div className="w-px h-6 bg-gray-800"></div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${countdown > 0 ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                      <span className="text-gray-400 text-xs font-mono">
                        {countdown > 0 ? 'Processing' : 'Redirecting'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Countdown number display */}
                <AnimatePresence mode="wait">
                  {countdown > 0 && (
                    <motion.div
                      key={countdown}
                      initial={{ opacity: 0, scale: 0.5, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.5, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6"
                    >
                      <div className="inline-flex items-center gap-4 bg-[#00D4FF]/5 px-6 py-3 rounded-full border border-[#00D4FF]/20">
                        <FaRocket className="text-[#00D4FF] w-5 h-5 animate-bounce" />
                        <span className="text-2xl font-bold text-white">
                          {countdown}
                        </span>
                        <span className="text-gray-400 text-sm font-mono">
                          seconds
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {countdown === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6"
                  >
                    <div className="inline-flex items-center gap-3 bg-[#06D6A0]/10 px-6 py-3 rounded-full border border-[#06D6A0]/20">
                      <FaCheckCircle className="text-[#06D6A0] w-5 h-5" />
                      <span className="text-[#06D6A0] font-mono text-sm">
                        Redirecting to Dashboard
                      </span>
                      <FaArrowRight className="text-[#06D6A0] w-4 h-4 animate-pulse" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Footer info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 pt-6 border-t border-gray-800/50"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
                  <span>● SECURE CONNECTION</span>
                  <span className="w-px h-3 bg-gray-700"></span>
                  <span>● AES-256 ENCRYPTION</span>
                  <span className="w-px h-3 bg-gray-700"></span>
                  <span>● v3.2.1</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>© 2024 Riseup-Tech Software Company</span>
                  <span className="w-px h-3 bg-gray-700"></span>
                  <span>All rights reserved</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;