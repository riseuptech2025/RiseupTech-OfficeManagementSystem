import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { 
  FaShieldAlt, 
  FaUserLock, 
  FaDatabase, 
  FaRegClock,
  FaCheckCircle,
  FaGlobe,
  FaLock,
  FaUserSecret,
  FaServer,
  FaEnvelope,
  FaCookie,
  FaPhone,
  FaUser,
  FaBuilding,
  FaFileAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { MdPrivacyTip, MdSecurity, MdVerifiedUser } from 'react-icons/md';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';

const Privacy = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pageRes, settingsRes] = await Promise.all([
        websiteService.getPageBySlug('privacy-policy'),
        websiteService.getSettings(),
      ]);
      setContent(pageRes.data);
      setSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error fetching privacy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Privacy principles data
  const privacyPrinciples = [
    {
      icon: <FaUserSecret className="text-3xl text-blue-400" />,
      title: 'Data Minimization',
      description: 'We only collect data that is necessary for providing our services to you.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <FaLock className="text-3xl text-green-400" />,
      title: 'Security First',
      description: 'Your data is protected with industry-standard encryption and security measures.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <FaUserLock className="text-3xl text-purple-400" />,
      title: 'User Control',
      description: 'You have full control over your data with options to access, modify, or delete.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FaShieldAlt className="text-3xl text-orange-400" />,
      title: 'Transparency',
      description: 'We are transparent about how we collect, use, and protect your information.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  // Data collection points
  const dataCollection = [
    {
      icon: <FaUser className="text-xl" />,
      title: 'Personal Information',
      details: 'Name, email address, phone number, and other identifiers'
    },
    {
      icon: <FaServer className="text-xl" />,
      title: 'Usage Data',
      details: 'How you interact with our website, features used, and preferences'
    },
    {
      icon: <FaCookie className="text-xl" />,
      title: 'Cookies & Tracking',
      details: 'Essential, functional, and analytical cookies for better experience'
    },
    {
      icon: <FaFileAlt className="text-xl" />,
      title: 'Communication Data',
      details: 'Support tickets, feedback, and correspondence with our team'
    }
  ];

  // Your rights
  const userRights = [
    'Right to Access your personal data',
    'Right to Rectify inaccurate data',
    'Right to Erasure (Right to be forgotten)',
    'Right to Restrict processing',
    'Right to Data Portability',
    'Right to Object to processing'
  ];

  // Animated gradient background variants
  const backgroundVariants = {
    animate: {
      background: [
        'radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)',
        'radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)',
        'radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)',
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
        <title>Privacy Policy - {settings.siteName || 'Riseup-Tech'}</title>
        <meta name="description" content={content?.seo?.description || 'Read our privacy policy to understand how we protect your data.'} />
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

        {/* Animated Shield Icons in Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`shield-${i}`}
              className="absolute"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                fontSize: `${40 + Math.random() * 60}px`
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <MdPrivacyTip />
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
              <MdPrivacyTip className="text-indigo-400 text-xl" />
              <span className="text-white/70 text-sm font-medium">Privacy Policy</span>
            </div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {content?.title || 'Privacy Policy'}
            </motion.h1>
            
            <motion.p 
              className="text-white/60 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Your privacy is important to us. Learn how we collect, use, and protect your personal information.
            </motion.p>
          </motion.div>

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 mb-12"
          >
            {/* Content with improved typography */}
            <div className="prose prose-invert max-w-none [&>*]:text-white/90 [&_h1]:text-4xl [&_h2]:text-3xl [&_h2]:text-white [&_h3]:text-2xl [&_h3]:text-white [&_a]:text-indigo-400 [&_a:hover]:text-indigo-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:leading-relaxed [&_p]:mb-4 [&_strong]:text-white [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/70">
              <div 
                dangerouslySetInnerHTML={{ __html: content?.content || '<p className="text-white/60">No content available.</p>' }}
              />
            </div>

            {/* Privacy Principles Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {privacyPrinciples.map((principle, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className={`bg-gradient-to-br ${principle.color} p-[1px] rounded-2xl`}
                >
                  <div className="bg-[#0a0a0f] rounded-2xl p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {principle.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {principle.title}
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Data Collection Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaDatabase className="text-indigo-400" />
                What Data We Collect
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dataCollection.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-indigo-400 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm mb-1">
                          {item.title}
                        </h4>
                        <p className="text-white/40 text-xs leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Your Rights Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12"
            >
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-indigo-500/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <IoShieldCheckmarkOutline className="text-indigo-400 text-3xl" />
                  Your Rights Under GDPR
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userRights.map((right, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3"
                    >
                      <FaCheckCircle className="text-indigo-400 text-sm flex-shrink-0" />
                      <span className="text-white/80 text-sm">{right}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Key Information Cards */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {[
                { icon: <MdVerifiedUser />, label: 'Compliance', value: 'GDPR Compliant' },
                { icon: <FaRegClock />, label: 'Data Retention', value: 'As Required' },
                { icon: <FaGlobe />, label: 'Jurisdiction', value: 'Global' },
                { icon: <FaShieldAlt />, label: 'Security Level', value: 'Enterprise Grade' }
              ].map((item, index) => (
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
                  <div className="text-white font-medium text-sm mt-1">
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <FaEnvelope className="text-indigo-400" />
                    Have Questions About Your Privacy?
                  </h3>
                  <p className="text-white/40 text-sm mt-1">
                    Contact our Data Protection Officer for any privacy concerns.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-shadow whitespace-nowrap"
                >
                  Contact Privacy Team
                </motion.button>
              </div>
            </motion.div>

            {/* Last Updated */}
            <motion.div 
              className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <FaRegClock className="text-indigo-400" />
                <span>Last updated: {content?.updatedAt ? new Date(content.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <FaInfoCircle className="text-white/20" />
                <span className="text-white/30 text-xs">Version 2.0</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-center text-white/30 text-sm"
          >
            <p>We are committed to protecting your privacy and ensuring transparency in our data practices.</p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Privacy;