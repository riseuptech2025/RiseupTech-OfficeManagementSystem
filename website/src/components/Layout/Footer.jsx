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
import { websiteService } from '../../services/api';

const Footer = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(false);
      
      console.log('🔄 Fetching footer settings...');
      
      // ============================================
      // Use the websiteService to fetch settings
      // ============================================
      const response = await websiteService.getSettings();
      
      console.log('✅ Settings response:', response);
      
      if (response.success && response.data) {
        setSettings(response.data);
        console.log('📊 Settings loaded:', response.data);
      } else {
        console.warn('⚠️ No settings data received, using defaults');
        setError(true);
      }
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      setError(true);
      // Use default settings on error
      setSettings({
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
    } finally {
      setLoading(false);
    }
  };

  // Define social links configuration with their keys from settings
  const socialLinksConfig = [
    { icon: FaFacebook, key: 'facebook', label: 'Facebook' },
    { icon: FaTwitter, key: 'twitter', label: 'Twitter' },
    { icon: FaLinkedin, key: 'linkedin', label: 'LinkedIn' },
    { icon: FaGithub, key: 'github', label: 'GitHub' },
    { icon: FaInstagram, key: 'instagram', label: 'Instagram' },
    { icon: FaYoutube, key: 'youtube', label: 'YouTube' },
  ];

  // Filter only social links that have a URL in settings
  const availableSocialLinks = socialLinksConfig
    .filter(({ key }) => {
      const value = settings[key];
      return value && value !== '' && value !== '#';
    })
    .map(({ icon, key, label }) => ({
      icon,
      url: settings[key],
      label
    }));

  // Debug log to see what's available
  console.log('🔗 Available social links:', availableSocialLinks);
  console.log('📞 Phone:', settings.companyPhone);

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

  // Get contact info with fallbacks
  const getPhone = () => settings.companyPhone || '9827399860';
  const getEmail = () => settings.companyEmail || 'mail@riseuptech.com.np';
  const getAddress = () => settings.companyAddress || 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal';

  return (
    <footer className="bg-[#111118] border-t border-[#00D4FF]/10">
      <div className="container mx-auto">
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
            {/* Show social icons only if there are available links */}
            {availableSocialLinks.length > 0 ? (
              <div className="flex gap-3 mt-4">
                {availableSocialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#0A0A0F] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all group"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-3 mt-4">
                {/* Default social links if none in settings */}
                <a
                  href="#"
                  className="w-10 h-10 bg-[#0A0A0F] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
                  aria-label="Facebook"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#0A0A0F] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
                  aria-label="Twitter"
                >
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#0A0A0F] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5" />
                </a>
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
                <span>{getAddress()}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaPhone className="text-[#00D4FF] flex-shrink-0" />
                <a href={`tel:${getPhone()}`} className="hover:text-[#00D4FF] transition-colors">
                  {getPhone()}
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaEnvelope className="text-[#00D4FF] flex-shrink-0" />
                <a href={`mailto:${getEmail()}`} className="hover:text-[#00D4FF] transition-colors">
                  {getEmail()}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;