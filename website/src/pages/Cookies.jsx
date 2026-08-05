import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { websiteService } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { 
  FaCookie, 
  FaShieldAlt, 
  FaUserSecret, 
  FaLock, 
  FaCheckCircle, 
  FaGlobe, 
  FaRegClock,
  FaUserCog,
  FaCookieBite
} from 'react-icons/fa';
import { BiCookie } from 'react-icons/bi';

const Cookies = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pageRes, settingsRes] = await Promise.all([
        websiteService.getPageBySlug('cookies-policy'),
        websiteService.getSettings(),
      ]);
      setContent(pageRes.data);
      setSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error fetching cookies policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Cookie categories data
  const cookieCategories = [
    {
      icon: <FaCookie className="text-3xl text-yellow-400" />,
      title: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <BiCookie className="text-3xl text-green-400" />,
      title: 'Preference Cookies',
      description: 'These cookies enable the website to remember your preferences and settings.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <FaUserSecret className="text-3xl text-purple-400" />,
      title: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <FaLock className="text-3xl text-red-400" />,
      title: 'Security Cookies',
      description: 'These cookies help ensure the security and integrity of our website.',
      color: 'from-red-500 to-orange-500'
    }
  ];

  // Animated gradient background variants
  const backgroundVariants = {
    animate: {
      background: [
        'radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
        'radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        'radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
      ],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Cookies Policy - {settings.siteName || 'Riseup-Tech'}</title>
        <meta name="description" content={content?.seo?.description || 'Read our cookies policy to understand how we use cookies.'} />
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
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{
                y: [null, -30, 30, -30, 0],
                scale: [0, 1, 1, 0],
                opacity: [0, 0.5, 0.5, 0]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
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
              <FaCookie className="text-yellow-400 text-xl" />
              <span className="text-white/70 text-sm font-medium">Cookie Policy</span>
            </div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {content?.title || 'Cookie Policy'}
            </motion.h1>
            
            <motion.p 
              className="text-white/60 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              We use cookies to enhance your browsing experience and analyze our traffic.
              Learn more about how we handle your data.
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
            <div className="prose prose-invert max-w-none [&>*]:text-white/90 [&_h1]:text-4xl [&_h2]:text-3xl [&_h2]:text-white [&_h3]:text-2xl [&_h3]:text-white [&_a]:text-blue-400 [&_a:hover]:text-blue-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:leading-relaxed [&_p]:mb-4 [&_strong]:text-white [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/70">
              <div 
                dangerouslySetInnerHTML={{ __html: content?.content || '<p className="text-white/60">No content available.</p>' }}
              />
            </div>

            {/* Cookie Categories Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {cookieCategories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className={`bg-gradient-to-br ${category.color} p-[1px] rounded-2xl`}
                >
                  <div className="bg-[#0a0a0f] rounded-2xl p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {category.title}
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Key Information Cards */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: <FaShieldAlt />, label: 'Data Protection', value: 'GDPR Compliant' },
                { icon: <FaRegClock />, label: 'Cookie Duration', value: 'Up to 2 Years' },
                { icon: <FaGlobe />, label: 'Global Coverage', value: 'International' },
                { icon: <FaCheckCircle />, label: 'User Control', value: 'Full Options' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/5"
                >
                  <div className="text-blue-400 text-2xl mb-2 flex justify-center">
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

            {/* Last Updated */}
            <motion.div 
              className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <FaRegClock className="text-blue-400" />
                <span>Last updated: {content?.updatedAt ? new Date(content.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-medium text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-shadow"
              >
                Accept All Cookies
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-white/30 text-sm"
          >
            <p>For more information, please refer to our Privacy Policy</p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Cookies;