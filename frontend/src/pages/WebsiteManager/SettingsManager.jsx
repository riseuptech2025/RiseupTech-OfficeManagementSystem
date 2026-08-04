// src/pages/WebsiteManager/SettingsManager.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCog, FaSpinner, FaSave, FaGlobe, FaPalette, 
  FaShareAlt, FaEnvelope, FaGavel, FaUsers,
  FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram, FaYoutube
} from 'react-icons/fa';
import axios from 'axios';
import { authService } from '../../services/api';

const SettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Riseup-Tech Software Company',
    siteTagline: 'Building Digital Excellence',
    siteLogo: '',
    favicon: '',
    
    // Contact Settings
    companyEmail: 'mail@riseuptech.com.np',
    companyPhone: '9827399860',
    companyAddress: 'Tilathi-Koiladi Rural Municipality-2, Launiya, Saptari, Nepal',
    
    // Social Settings
    facebook: '',
    twitter: '',
    linkedin: '',
    github: '',
    instagram: '',
    youtube: '',
    
    // SEO Settings
    metaTitle: 'Riseup-Tech - Software Development Company',
    metaDescription: 'Riseup-Tech Software Company delivers innovative web solutions, mobile apps, and software development services.',
    metaKeywords: 'software development, web development, mobile apps, Nepal',
    
    // Appearance
    primaryColor: '#00D4FF',
    secondaryColor: '#7C3AED',
    darkMode: true,
    
    // Legal
    termsOfService: '',
    privacyPolicy: '',
    cookiesPolicy: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/website/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Settings fetched:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        setSettings(prev => ({
          ...prev,
          ...response.data.data
        }));
      } else {
        console.warn('⚠️ No settings data received');
      }
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      setErrorMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const token = authService.getToken();
      
      console.log('💾 Saving settings:', settings);
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/website/settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Settings saved:', response.data);
      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      setErrorMessage(error.response?.data?.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  const SocialIconInput = ({ icon: Icon, label, key }) => (
    <div className="flex items-center gap-2">
      <Icon className="text-gray-400 w-5 h-5 flex-shrink-0" />
      <input
        type="text"
        value={settings[key] || ''}
        onChange={(e) => handleChange(key, e.target.value)}
        className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
        placeholder={label}
      />
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Website Settings</h2>
          <p className="text-gray-400 text-sm">Configure your website</p>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-4">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div className="bg-[#0A0A0F] rounded-xl p-6 border border-[#00D4FF]/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaGlobe className="text-[#00D4FF]" />
            General Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Site Tagline</label>
              <input
                type="text"
                value={settings.siteTagline}
                onChange={(e) => handleChange('siteTagline', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              />
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="bg-[#0A0A0F] rounded-xl p-6 border border-[#00D4FF]/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaEnvelope className="text-[#00D4FF]" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Company Email</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Company Phone</label>
              <input
                type="text"
                value={settings.companyPhone}
                onChange={(e) => handleChange('companyPhone', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Company Address</label>
              <input
                type="text"
                value={settings.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              />
            </div>
          </div>
        </div>

        {/* Social Settings */}
        <div className="bg-[#0A0A0F] rounded-xl p-6 border border-[#00D4FF]/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaShareAlt className="text-[#00D4FF]" />
            Social Media
          </h3>
          <div className="space-y-3">
            <SocialIconInput icon={FaFacebook} label="Facebook URL" key="facebook" />
            <SocialIconInput icon={FaTwitter} label="Twitter URL" key="twitter" />
            <SocialIconInput icon={FaLinkedin} label="LinkedIn URL" key="linkedin" />
            <SocialIconInput icon={FaGithub} label="GitHub URL" key="github" />
            <SocialIconInput icon={FaInstagram} label="Instagram URL" key="instagram" />
            <SocialIconInput icon={FaYoutube} label="YouTube URL" key="youtube" />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsManager;