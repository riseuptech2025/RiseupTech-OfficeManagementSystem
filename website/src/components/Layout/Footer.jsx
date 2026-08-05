// src/components/Layout/Footer.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaGithub, 
  FaInstagram, 
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe
} from 'react-icons/fa';
import logo from '../../assets/logo.png';

const Footer = () => {
  const [settings, setSettings] = useState({
    companyPhone: '9827399860',
    companyEmail: 'mail@riseuptech.com.np',
    companyAddress: 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal',
    facebook: '',
    twitter: '',
    linkedin: '',
    github: '',
    instagram: '',
    youtube: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('📡 Fetching settings for footer...');
      
      // Use the API URL from environment or fallback to relative path
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      
      const response = await fetch(`${apiUrl}/website/settings`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Settings fetched:', data);
      
      if (data.success && data.data) {
        // Merge with defaults
        setSettings(prev => ({
          ...prev,
          ...data.data
        }));
      } else {
        console.warn('⚠️ No settings data received, using defaults');
      }
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      setError(true);
      // Keep using default settings
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Social Links Configuration
  // ============================================
  const socialLinksConfig = [
    { 
      key: 'facebook', 
      icon: FaFacebook, 
      label: 'Facebook',
      color: '#1877F2',
      bgColor: 'hover:bg-[#1877F2]'
    },
    { 
      key: 'twitter', 
      icon: FaTwitter, 
      label: 'Twitter',
      color: '#1DA1F2',
      bgColor: 'hover:bg-[#1DA1F2]'
    },
    { 
      key: 'linkedin', 
      icon: FaLinkedin, 
      label: 'LinkedIn',
      color: '#0A66C2',
      bgColor: 'hover:bg-[#0A66C2]'
    },
    { 
      key: 'github', 
      icon: FaGithub, 
      label: 'GitHub',
      color: '#ffffff',
      bgColor: 'hover:bg-[#ffffff]'
    },
    { 
      key: 'instagram', 
      icon: FaInstagram, 
      label: 'Instagram',
      color: '#E4405F',
      bgColor: 'hover:bg-[#E4405F]'
    },
    { 
      key: 'youtube', 
      icon: FaYoutube, 
      label: 'YouTube',
      color: '#FF0000',
      bgColor: 'hover:bg-[#FF0000]'
    },
  ];

  // Filter only social links that have a URL
  const availableSocialLinks = socialLinksConfig
    .filter(({ key }) => {
      const url = settings[key];
      return url && url.trim() !== '' && url !== '#';
    })
    .map(({ key, icon, label, color, bgColor }) => ({
      icon,
      label,
      url: settings[key],
      color,
      bgColor
    }));

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
  ];

  const legalLinks = [
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Cookies Policy', path: '/cookies' },
  ];

  // Show loading state
  if (loading) {
    return (
      <footer className="bg-[#111118] border-t border-[#00D4FF]/10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-400">Loading...</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#111118] border-t border-[#00D4FF]/10">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Riseup-Tech" className="h-10 w-auto" />
              <span className="text-white font-bold text-lg">Riseup-Tech</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Building Digital Excellence through innovative software solutions, 
              web development, and mobile applications.
            </p>
            
            {/* Social Icons - Only show if there are available links */}
            {availableSocialLinks.length > 0 && (
              <div className="flex gap-3 mt-4">
                {availableSocialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-[#0A0A0F] rounded-lg flex items-center justify-center text-gray-400 transition-all duration-300 ${social.bgColor} hover:text-white hover:scale-110 hover:shadow-lg`}
                      aria-label={social.label}
                      title={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#00D4FF] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-[#00D4FF] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <FaMapMarkerAlt className="text-[#00D4FF] mt-1 flex-shrink-0" />
                <span>{settings.companyAddress || 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaPhone className="text-[#00D4FF] flex-shrink-0" />
                <a href={`tel:${settings.companyPhone || '9827399860'}`} className="hover:text-[#00D4FF] transition-colors">
                  {settings.companyPhone || '9827399860'}
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaEnvelope className="text-[#00D4FF] flex-shrink-0" />
                <a href={`mailto:${settings.companyEmail || 'mail@riseuptech.com.np'}`} className="hover:text-[#00D4FF] transition-colors">
                  {settings.companyEmail || 'mail@riseuptech.com.np'}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-[#00D4FF]/10 py-6 text-center text-sm text-gray-500">
         <p>© {new Date().getFullYear()} <strong>Riseup-Tech Software Company</strong>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;