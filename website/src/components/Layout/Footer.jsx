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
        // Try to fetch from API, fallback to defaults
        const response = await fetch('/api/website/settings');
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.log('Using default settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Define social links configuration with their keys from settings
  const socialLinksConfig = [
    { icon: FaFacebook, key: 'facebook' },
    { icon: FaTwitter, key: 'twitter' },
    { icon: FaLinkedin, key: 'linkedin' },
    { icon: FaGithub, key: 'github' },
    { icon: FaInstagram, key: 'instagram' },
    { icon: FaYoutube, key: 'youtube' },
  ];

  // Filter only social links that have a URL in settings
  const availableSocialLinks = socialLinksConfig
    .filter(({ key }) => settings[key] && settings[key] !== '#')
    .map(({ icon, key }) => ({
      icon,
      url: settings[key]
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
              <div className="flex gap-3 mt-4">
                {availableSocialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
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
                <FaMapMarkerAlt className="text-[#00D4FF] mt-1" />
                <span>{settings.companyAddress || 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal'}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaPhone className="text-[#00D4FF]" />
                <a href={`tel:${settings.companyPhone || '9827399860'}`} className="hover:text-[#00D4FF] transition-colors">
                  {settings.companyPhone || '9827399860'}
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaEnvelope className="text-[#00D4FF]" />
                <a href={`mailto:${settings.companyEmail || 'mail@riseuptech.com.np'}`} className="hover:text-[#00D4FF] transition-colors">
                  {settings.companyEmail || 'mail@riseuptech.com.np'}
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