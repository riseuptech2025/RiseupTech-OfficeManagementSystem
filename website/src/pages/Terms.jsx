import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { 
  FaFileContract, 
  FaShieldAlt, 
  FaGavel, 
  FaRegClock,
  FaCheckCircle,
  FaGlobe,
  FaUserShield,
  FaHandshake,
  FaBalanceScale,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaUsers,
  FaLock,
  FaFileAlt,
  FaRegFilePdf,
  FaRegCopy,
  FaRegCalendarAlt,
  FaUserCog,
  FaServer,
  FaCopyright
} from 'react-icons/fa';
import { MdGavel, MdVerified, MdPolicy, MdSecurity } from 'react-icons/md';
import { IoDocumentTextOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

const Terms = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pageRes, settingsRes] = await Promise.all([
        websiteService.getPageBySlug('terms-and-conditions'),
        websiteService.getSettings(),
      ]);
      setContent(pageRes.data);
      setSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Key terms sections
  const keySections = [
    {
      icon: <FaHandshake className="text-2xl" />,
      title: 'Acceptance of Terms',
      description: 'By using our services, you agree to comply with and be bound by these terms.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <FaUserShield className="text-2xl" />,
      title: 'User Accounts',
      description: 'You are responsible for maintaining the confidentiality of your account credentials.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <FaBalanceScale className="text-2xl" />,
      title: 'User Obligations',
      description: 'You agree to use our services in compliance with all applicable laws and regulations.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FaClipboardCheck className="text-2xl" />,
      title: 'Acceptable Use',
      description: 'Our services must be used responsibly and ethically at all times.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <FaLock className="text-2xl" />,
      title: 'Intellectual Property',
      description: 'All content, trademarks, and data on our platform are our intellectual property.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <FaExclamationTriangle className="text-2xl" />,
      title: 'Limitation of Liability',
      description: 'We provide our services "as is" with no guarantees or warranties.',
      color: 'from-red-500 to-pink-500'
    }
  ];

  // Quick links for navigation
  const quickLinks = [
    'Acceptance of Terms',
    'User Accounts',
    'User Obligations',
    'Acceptable Use',
    'Intellectual Property',
    'Limitation of Liability',
    'Termination',
    'Governing Law'
  ];

  // Key metrics
  const metrics = [
    { icon: <FaFileContract />, label: 'Legal Compliance', value: '100%' },
    { icon: <FaUsers />, label: 'Active Users', value: '10K+' },
    { icon: <FaShieldAlt />, label: 'Data Protection', value: 'GDPR' },
    { icon: <FaGavel />, label: 'Dispute Resolution', value: '48 Hours' }
  ];

  // Animated gradient background variants
  const backgroundVariants = {
    animate: {
      background: [
        'radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.10) 0%, transparent 50%)',
        'radial-gradient(ellipse at 80% 50%, rgba(236, 72, 153, 0.10) 0%, transparent 50%)',
        'radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.10) 0%, transparent 50%)',
      ],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Terms & Conditions - {settings.siteName || 'Riseup-Tech'}</title>
        <meta name="description" content={content?.seo?.description || 'Read our terms and conditions for using our services.'} />
      </Helmet>

      {/* Hero Section with Gradient Background */}
      <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
        <motion.div
          variants={backgroundVariants}
          animate="animate"
          className="absolute inset-0 bg-[#0a0a0f]"
        />
        
        {/* Animated Particles/Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white/5 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{
                y: [null, -40, 40, -40, 0],
                scale: [0, 1.5, 1.5, 0],
                opacity: [0, 0.3, 0.3, 0]
              }}
              transition={{
                duration: 6 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 6
              }}
            />
          ))}
        </div>

        {/* Animated Legal Icons in Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`legal-${i}`}
              className="absolute"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                fontSize: `${50 + Math.random() * 70}px`
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 25 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {i % 2 === 0 ? <MdGavel /> : <IoDocumentTextOutline />}
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-lg rounded-full border border-white/10 mb-8">
              <FaFileContract className="text-indigo-400 text-xl" />
              <span className="text-white/70 text-sm font-medium">Terms & Conditions</span>
            </div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {content?.title || 'Terms & Conditions'}
            </motion.h1>
            
            <motion.p 
              className="text-white/60 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Please read these terms carefully before using our services. By using our platform, you agree to these conditions.
            </motion.p>
          </motion.div>

          {/* Quick Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {quickLinks.map((link, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(index)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeSection === index
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link}
              </motion.button>
            ))}
          </motion.div>

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 mb-12"
          >
            {/* Content with improved typography */}
            <div className="prose prose-invert max-w-none [&>*]:text-white/90 [&_h1]:text-4xl [&_h2]:text-3xl [&_h2]:text-white [&_h3]:text-2xl [&_h3]:text-white [&_a]:text-indigo-400 [&_a:hover]:text-indigo-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:leading-relaxed [&_p]:mb-4 [&_strong]:text-white [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/70">
              <div 
                dangerouslySetInnerHTML={{ __html: content?.content || '<p className="text-white/60">No content available.</p>' }}
              />
            </div>

            {/* Key Sections Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {keySections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  whileHover={{ 
                    scale: 1.03,
                    transition: { duration: 0.2 }
                  }}
                  className={`bg-gradient-to-br ${section.color} p-[1px] rounded-2xl`}
                >
                  <div className="bg-[#0a0a0f] rounded-2xl p-5 h-full">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-white/80 mt-1">
                        {section.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm mb-1.5">
                          {section.title}
                        </h3>
                        <p className="text-white/50 text-xs leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Key Metrics */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {metrics.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/5"
                >
                  <div className="text-indigo-400 text-2xl mb-2 flex justify-center">
                    {item.icon}
                  </div>
                  <div className="text-white/40 text-xs uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-white font-bold text-lg mt-1">
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Legal Documents Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <FaRegFilePdf className="text-indigo-400" />
                Legal Documents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { title: 'Terms of Service', icon: <FaFileContract />, size: '2.4 MB' },
                  { title: 'Privacy Policy', icon: <MdPolicy />, size: '1.8 MB' },
                  { title: 'Cookie Policy', icon: <FaRegCopy />, size: '1.2 MB' },
                ].map((doc, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-indigo-500/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-indigo-400 text-xl">
                        {doc.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          {doc.title}
                        </div>
                        <div className="text-white/30 text-xs">
                          PDF • {doc.size}
                        </div>
                      </div>
                      <FaRegClock className="text-white/20 text-sm" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Important Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/20"
            >
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">Important Notice</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    These terms are subject to change without prior notice. Please review them periodically to stay informed about any updates.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Last Updated */}
            <motion.div 
              className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <FaRegCalendarAlt className="text-indigo-400" />
                <span>Last updated: {content?.updatedAt ? new Date(content.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/5 rounded-full text-white/60 text-xs hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                >
                  <FaCopyright className="text-indigo-400" />
                  Version 3.2
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-xs font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-shadow"
                >
                  Download PDF
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-white/30 text-sm space-y-2"
          >
            <p>By continuing to use our services, you agree to these terms and conditions.</p>
            <p className="text-white/20 text-xs">For any legal inquiries, please contact our legal team.</p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Terms;