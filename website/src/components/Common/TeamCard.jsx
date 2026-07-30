import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaEnvelope, FaGlobe, FaUser } from 'react-icons/fa';

const TeamCard = ({ member, index }) => {
  const socialIcons = { 
    facebook: FaFacebook,
    twitter: FaTwitter,
    linkedin: FaLinkedin,
    github: FaGithub,
    instagram: FaInstagram,
    email: FaEnvelope,
    website: FaGlobe,
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-gradient-to-br from-[#111118] to-[#0A0A0F] rounded-2xl overflow-hidden border border-[#00D4FF]/10 hover:border-[#00D4FF]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#00D4FF]/5"
    >
      {/* Background Gradient Orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-3xl group-hover:bg-[#00D4FF]/10 transition-all duration-700" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#7C3AED]/5 rounded-full blur-3xl group-hover:bg-[#7C3AED]/10 transition-all duration-700" />
      
      {/* Profile Image Section */}
      <div className="relative pt-8 px-6">
        <div className="relative w-36 h-36 mx-auto">
          {/* Animated Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] p-[2px] group-hover:animate-spin-slow">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          </div>
          
          {/* Profile Image */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#00D4FF] transition-all duration-500 bg-[#0A0A0F]">
            {member.image ? (
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-3xl font-bold text-white">
                {getInitials(member.name)}
              </div>
            )}
          </div>
          
          {/* Online Status Dot */}
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A0A0F] shadow-lg shadow-green-500/20">
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative px-6 pb-8 pt-4 text-center">
        {/* Name with Gradient */}
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00D4FF] group-hover:to-[#7C3AED] transition-all duration-300">
          {member.name}
        </h3>
        
        {/* Position Badge */}
        <div className="inline-block px-3 py-1 mb-3 bg-[#00D4FF]/10 rounded-full border border-[#00D4FF]/20">
          <p className="text-[#00D4FF] text-xs font-medium">
            {member.position}
          </p>
        </div>
        
        {/* Bio */}
        {member.bio && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 min-h-[3rem]">
            {member.bio}
          </p>
        )}
        
        {/* Social Links */}
        {member.socialLinks && Object.values(member.socialLinks).some(url => url) && (
          <div className="flex justify-center gap-2 flex-wrap">
            {Object.entries(member.socialLinks).map(([platform, url]) => {
              if (!url) return null;
              const Icon = socialIcons[platform];
              if (!Icon) return null;
              
              return (
                <motion.a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-10 h-10 rounded-xl bg-[#0A0A0F] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 group/social overflow-hidden"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Social Icon Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] opacity-0 group-hover/social:opacity-100 transition-opacity duration-300" />
                  <Icon className="relative z-10 w-4 h-4 group-hover/social:scale-110 transition-transform duration-300" />
                </motion.a>
              );
            })}
          </div>
        )}
        
        
      </div>
    </motion.div>
  );
};

export default TeamCard;