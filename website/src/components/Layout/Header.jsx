import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown, FaRocket } from 'react-icons/fa';
import logo from '../../assets/logo.png';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { 
      label: 'Services', path: '/services',
      
    },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;
  const isDropdownActive = (dropdownItems) => {
    return dropdownItems?.some(item => location.pathname === item.path);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-[#111118]/95 backdrop-blur-xl border-b border-[#00D4FF]/20 shadow-2xl shadow-[#00D4FF]/5' 
        : 'bg-black'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo - Updated for mobile */}
          <Link to="/" className="flex items-center gap-2 group relative">
            <div className="relative">
              <img src={logo} alt="Riseup-Tech" className="h-10 w-auto md:h-12 transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            {/* Always show platform name - mobile and desktop */}
            <div className="flex flex-col">
              <span className="text-white font-bold text-base sm:text-lg md:text-xl group-hover:text-[#00D4FF] transition-colors duration-300">
                Riseup-Tech
              </span>
              <span className="text-[8px] sm:text-[10px] text-gray-400 tracking-wider uppercase whitespace-nowrap">
                Software Company
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <div key={item.path} className="relative group">
                {item.dropdown ? (
                  <div 
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 relative overflow-hidden ${
                        isActive(item.path) || isDropdownActive(item.dropdown)
                          ? 'text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {/* Dark background effect matching page */}
                      <span className="absolute inset-0 rounded-lg overflow-hidden">
                        {/* Base background */}
                        <span className={`absolute inset-0 transition-all duration-500 ${
                          isActive(item.path) || isDropdownActive(item.dropdown)
                            ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#7C3AED]/20'
                            : 'bg-transparent hover:bg-white/5'
                        }`}></span>
                        
                        {/* Water wave animation */}
                        <span className={`absolute inset-0 bg-gradient-to-r from-[#00D4FF]/30 to-[#7C3AED]/30 transition-opacity duration-500 ${
                          isActive(item.path) || isDropdownActive(item.dropdown)
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <span className="absolute inset-0 animate-wave" style={{
                            background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), rgba(124,58,237,0.2), transparent)',
                            backgroundSize: '200% 100%',
                            animation: 'wave 3s ease-in-out infinite'
                          }}></span>
                          <span className="absolute inset-0 animate-wave-delayed" style={{
                            background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), rgba(124,58,237,0.15), transparent)',
                            backgroundSize: '200% 100%',
                            animation: 'wave 3s ease-in-out infinite 1.5s'
                          }}></span>
                        </span>
                        
                        {/* Water reflection effect */}
                        <span className={`absolute inset-0 transition-opacity duration-500 ${
                          isActive(item.path) || isDropdownActive(item.dropdown)
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-50'
                        }`}>
                          <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent transform -skew-y-6"></span>
                        </span>
                      </span>
                      
                      <span className="relative z-10 flex items-center gap-1">
                        {item.label}
                        <FaChevronDown className={`text-xs transition-transform duration-300 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`} />
                      </span>
                      
                      {/* Active bottom line */}
                      {(isActive(item.path) || isDropdownActive(item.dropdown)) && (
                        <motion.div
                          layoutId="activeLine"
                          className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full z-20"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-1 w-56 bg-[#111118]/95 backdrop-blur-xl border border-[#00D4FF]/20 rounded-xl shadow-2xl shadow-[#00D4FF]/10 py-2"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`block px-4 py-2.5 text-sm transition-all duration-200 ${
                                location.pathname === subItem.path
                                  ? 'text-[#00D4FF] bg-[#00D4FF]/10'
                                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                      isActive(item.path)
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {/* Dark background effect matching page */}
                    <span className="absolute inset-0 rounded-lg overflow-hidden">
                      {/* Base background */}
                      <span className={`absolute inset-0 transition-all duration-500 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#7C3AED]/20'
                          : 'bg-transparent hover:bg-white/5'
                      }`}></span>
                      
                      {/* Water wave animation */}
                      <span className={`absolute inset-0 bg-gradient-to-r from-[#00D4FF]/30 to-[#7C3AED]/30 transition-opacity duration-500 ${
                        isActive(item.path)
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <span className="absolute inset-0 animate-wave" style={{
                          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), rgba(124,58,237,0.2), transparent)',
                          backgroundSize: '200% 100%',
                          animation: 'wave 3s ease-in-out infinite'
                        }}></span>
                        <span className="absolute inset-0 animate-wave-delayed" style={{
                          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), rgba(124,58,237,0.15), transparent)',
                          backgroundSize: '200% 100%',
                          animation: 'wave 3s ease-in-out infinite 1.5s'
                        }}></span>
                      </span>
                      
                      {/* Water reflection effect */}
                      <span className={`absolute inset-0 transition-opacity duration-500 ${
                        isActive(item.path)
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-50'
                      }`}>
                        <span className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent transform -skew-y-6"></span>
                      </span>
                    </span>
                    
                    <span className="relative z-10">{item.label}</span>
                    
                    {/* Active bottom line */}
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="activeLine"
                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-full z-20"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Buttons - Matching page theme */}
          <div className="hidden md:flex items-center gap-3">
            {/* Primary Button - Start project with Water Effect */}
            <Link
              to="/contact"
              className="group relative px-5 py-2 rounded-lg font-medium text-sm transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-[#00D4FF]/30 hover:scale-105"
            >
              {/* Water-filled background */}
              <span className="absolute inset-0 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-lg overflow-hidden">
                {/* Water wave overlay */}
                <span className="absolute inset-0 animate-wave" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), rgba(255,255,255,0.3), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'wave 2.5s ease-in-out infinite'
                }}></span>
                <span className="absolute inset-0 animate-wave-delayed" style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.2), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'wave 2.5s ease-in-out infinite 1.25s'
                }}></span>
                
                {/* Water surface reflection */}
                <span className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent transform -skew-y-12"></span>
                
                {/* Water bubbles effect */}
                <span className="absolute bottom-0 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-bubble" style={{animationDelay: '0s'}}></span>
                <span className="absolute bottom-0 right-1/3 w-0.5 h-0.5 bg-white/20 rounded-full animate-bubble" style={{animationDelay: '0.5s'}}></span>
                <span className="absolute bottom-0 left-1/2 w-0.5 h-0.5 bg-white/20 rounded-full animate-bubble" style={{animationDelay: '1s'}}></span>
              </span>
              
              <span className="relative z-10 flex items-center gap-2 text-white">
                <FaRocket className="text-xs" />
                Start project
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white text-xl p-2 hover:bg-white/5 rounded-lg transition-colors relative"
          >
            <span className="relative flex items-center justify-center">
              {isOpen ? (
                <FaTimes className="rotate-90 transition-transform duration-300" />
              ) : (
                <FaBars className="transition-transform duration-300" />
              )}
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-[#00D4FF]/20"
            >
              <nav className="py-3 flex flex-col gap-1">
                {navItems.map((item) => (
                  <div key={item.path}>
                    {item.dropdown ? (
                      <div>
                        <div className="px-4 py-2.5 text-gray-300 font-medium flex items-center justify-between">
                          {item.label}
                          <FaChevronDown className="text-xs" />
                        </div>
                        <div className="pl-6 flex flex-col gap-1">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setIsOpen(false)}
                              className={`px-4 py-2.5 rounded-lg transition-colors text-sm ${
                                location.pathname === subItem.path
                                  ? 'bg-[#00D4FF]/10 text-[#00D4FF]'
                                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                          isActive(item.path)
                            ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#7C3AED]/20 text-[#00D4FF]'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {isActive(item.path) && (
                          <div className="w-1 h-5 bg-gradient-to-b from-[#00D4FF] to-[#7C3AED] rounded-full"></div>
                        )}
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                
                {/* Mobile buttons */}
                <div className="flex flex-col gap-2 mt-3 px-4">
                  {/* <Link
                    to="/about"
                    onClick={() => setIsOpen(false)}
                    className="group relative px-4 py-3 rounded-lg text-center font-medium transition-all duration-300 overflow-hidden border border-gray-600"
                  >
                    <span className="absolute inset-0 rounded-lg overflow-hidden">
                      <span className="absolute inset-0 bg-transparent hover:bg-gradient-to-r from-[#00D4FF]/10 to-[#7C3AED]/10 transition-all duration-500"></span>
                    </span>
                    <span className="relative z-10 text-gray-300 group-hover:text-white">
                      Secondary
                    </span>
                  </Link> */}
                  <Link
                    to="/contact"
                    onClick={() => setIsOpen(false)}
                    className="group relative px-4 py-3 rounded-lg text-center font-medium transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-[#00D4FF]/20"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-lg overflow-hidden">
                      <span className="absolute inset-0 animate-wave" style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), rgba(255,255,255,0.3), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'wave 2.5s ease-in-out infinite'
                      }}></span>
                      <span className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent transform -skew-y-12"></span>
                    </span>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                      <FaRocket className="text-xs" />
                      Start project
                    </span>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS Animations - FIXED */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes wave {
            0% { transform: translateX(-100%) scaleY(1); }
            50% { transform: translateX(0%) scaleY(1.2); }
            100% { transform: translateX(100%) scaleY(1); }
          }
          
          @keyframes wave-delayed {
            0% { transform: translateX(-100%) scaleY(1); }
            50% { transform: translateX(0%) scaleY(1.3); }
            100% { transform: translateX(100%) scaleY(1); }
          }
          
          @keyframes bubble {
            0% { transform: translateY(0) scale(0); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(-40px) scale(1); opacity: 0; }
          }
          
          .animate-wave { animation: wave 3s ease-in-out infinite; }
          .animate-wave-delayed { animation: wave-delayed 3s ease-in-out infinite 1.5s; }
          .animate-bubble { animation: bubble 2s ease-in-out infinite; }
        `
      }} />
    </header>
  );
};

export default Header;