// src/pages/WebsiteManager/SettingsManager.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCog, FaSpinner, FaSave, FaGlobe, FaPalette, 
  FaShareAlt, FaEnvelope, FaGavel, FaUsers
} from 'react-icons/fa';
import api, { authService } from '../../services/api';

const SettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
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
      const response = await api.get('/website/settings');
      const data = response.data.data;
      
      // Merge fetched settings with default settings
      setSettings(prev => ({
        ...prev,
        ...data
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    // Clear messages when user makes changes
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    
    try {
      // Send all settings as an object
      const response = await api.put('/website/settings', settings);
      
      setSuccess('Settings saved successfully!');
      // Refresh settings to get updated values
      await fetchSettings();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.response?.data?.message || 'Error saving settings');
      setTimeout(() => setError(''), 3000);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Website Settings</h2>
          <p className="text-gray-400 text-sm">Configure your website</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
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
          <p className="text-sm text-gray-400 mb-4">
            Enter the full URLs for your social media profiles. Leave empty to hide.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Facebook</label>
              <input
                type="text"
                value={settings.facebook || ''}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Twitter</label>
              <input
                type="text"
                value={settings.twitter || ''}
                onChange={(e) => handleChange('twitter', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn</label>
              <input
                type="text"
                value={settings.linkedin || ''}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">GitHub</label>
              <input
                type="text"
                value={settings.github || ''}
                onChange={(e) => handleChange('github', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                placeholder="https://github.com/yourusername"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Instagram</label>
              <input
                type="text"
                value={settings.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">YouTube</label>
              <input
                type="text"
                value={settings.youtube || ''}
                onChange={(e) => handleChange('youtube', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-[#0A0A0F] rounded-xl p-6 border border-[#00D4FF]/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaCog className="text-[#00D4FF]" />
            SEO Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Meta Title</label>
              <input
                type="text"
                value={settings.metaTitle || ''}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Meta Description</label>
              <textarea
                value={settings.metaDescription || ''}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                rows="2"
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Meta Keywords</label>
              <input
                type="text"
                value={settings.metaKeywords || ''}
                onChange={(e) => handleChange('metaKeywords', e.target.value)}
                className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-[#0A0A0F] rounded-xl p-6 border border-[#00D4FF]/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaPalette className="text-[#00D4FF]" />
            Appearance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor || '#00D4FF'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-700"
                />
                <input
                  type="text"
                  value={settings.primaryColor || '#00D4FF'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.secondaryColor || '#7C3AED'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-700"
                />
                <input
                  type="text"
                  value={settings.secondaryColor || '#7C3AED'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                />
              </div>
            </div>
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