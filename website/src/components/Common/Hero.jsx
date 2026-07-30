import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = ({ 
  title, 
  subtitle, 
  ctaText = 'Get Started', 
  ctaLink = '/contact',
  secondaryCtaText = 'Learn More',
  secondaryCtaLink = '/about',
  image,
  children 
}) => {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/5 via-transparent to-[#7C3AED]/5" />
      
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00D4FF]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8">
              {subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={ctaLink}
                className="px-8 py-3 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all font-medium"
              >
                {ctaText}
              </Link>
              <Link
                to={secondaryCtaLink}
                className="px-8 py-3 border border-[#00D4FF]/30 text-white rounded-lg hover:bg-[#00D4FF]/10 transition-all font-medium"
              >
                {secondaryCtaText}
              </Link>
            </div>
            {children}
          </motion.div>

          {/* Image */}
          {image && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-[#00D4FF]/10 shadow-2xl shadow-[#00D4FF]/10">
                <img src={image} alt="Hero" className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;