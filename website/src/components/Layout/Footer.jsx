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
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Use the same API endpoint as SettingsManager
        const response = await fetch('/api/website/settings');
        const data = await response.json();
        
        if (data.success) {
          console.log('Fetched settings:', data.data); // Debug log
          setSettings(data.data);
        } else {
          console.log('API returned success: false');
          // Fallback to default settings
          setSettings({
            facebook: '',
            twitter: '',
            linkedin: '',
            github: '',
            instagram: '',
            youtube: '',
            companyEmail: 'mail@riseuptech.com.np',
            companyPhone: '9827399860',
            companyAddress: 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal'
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Fallback to default settings
        setSettings({
          facebook: '',
          twitter: '',
          linkedin: '',
          github: '',
          instagram: '',
          youtube: '',
          companyEmail: 'mail@riseuptech.com.np',
          companyPhone: '9827399860',
          companyAddress: 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

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
      // Check if value exists and is not empty and not '#'
      return value && value !== '' && value !== '#';
    })
    .map(({ icon, key, label }) => ({
      icon,
      label,
      url: settings[key]
    }));

  console.log('Available social links:', availableSocialLinks); // Debug log

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

  // Helper to get contact info with fallback
  const getContactInfo = (key, defaultValue) => {
    return settings[key] || defaultValue;
  };

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
            {availableSocialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {availableSocialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 bg-[#0A0A0F] rounded-lg flex items-center justify-center text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
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
                <span>{getContactInfo('companyAddress', 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal')}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaPhone className="text-[#00D4FF] flex-shrink-0" />
                <a href={`tel:${getContactInfo('companyPhone', '9827399860')}`} className="hover:text-[#00D4FF] transition-colors">
                  {getContactInfo('companyPhone', '9827399860')}
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaEnvelope className="text-[#00D4FF] flex-shrink-0" />
                <a href={`mailto:${getContactInfo('companyEmail', 'mail@riseuptech.com.np')}`} className="hover:text-[#00D4FF] transition-colors">
                  {getContactInfo('companyEmail', 'mail@riseuptech.com.np')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[#00D4FF]/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Riseup-Tech Software Company. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Built with ❤️ by Riseup-Tech Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;