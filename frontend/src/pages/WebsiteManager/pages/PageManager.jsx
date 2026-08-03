// src/pages/WebsiteManager/pages/PageManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEdit, FaTrash, FaEye, FaSpinner, FaSave, FaTimes,
  FaInfoCircle, FaFileContract, FaShieldAlt, FaCookie
} from 'react-icons/fa';
import axios from 'axios';
import { authService } from '../../../services/api';
import RichTextEditor from '../../../components/Common/RichTextEditor';

const PageManager = ({ pageType, pageLabel, pageIcon, defaultTitle, defaultSlug }) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: defaultTitle || '',
    content: '',
    excerpt: '',
    type: pageType,
    status: 'published',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/website/pages/slug/${defaultSlug}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.data) {
        setPage(response.data.data);
        setFormData({
          title: response.data.data.title || defaultTitle,
          content: response.data.data.content || '',
          excerpt: response.data.data.excerpt || '',
          type: response.data.data.type || pageType,
          status: response.data.data.status || 'published',
          seo: response.data.data.seo || {
            title: '',
            description: '',
            keywords: []
          }
        });
      }
    } catch (error) {
      console.log(`No existing ${pageLabel} page found, will create new one`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = authService.getToken();
      const dataToSend = {
        ...formData,
        type: pageType,
      };

      if (page) {
        // Update existing page
        await axios.put(
          `${import.meta.env.VITE_API_URL}/website/pages/${page._id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new page
        await axios.post(
          `${import.meta.env.VITE_API_URL}/website/pages`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setIsEditing(false);
      await fetchPage();
      alert(`${pageLabel} page saved successfully!`);
    } catch (error) {
      console.error(`Error saving ${pageLabel} page:`, error);
      alert(error.response?.data?.message || `Error saving ${pageLabel} page`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!page) return;
    if (!window.confirm(`Are you sure you want to delete the ${pageLabel} page?`)) return;
    
    try {
      const token = authService.getToken();
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/website/pages/${page._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPage(null);
      setFormData({
        title: defaultTitle,
        content: '',
        excerpt: '',
        type: pageType,
        status: 'draft',
        seo: {
          title: '',
          description: '',
          keywords: []
        }
      });
      alert(`${pageLabel} page deleted successfully!`);
    } catch (error) {
      console.error(`Error deleting ${pageLabel} page:`, error);
      alert(`Error deleting ${pageLabel} page`);
    }
  };

  const getIcon = () => {
    const icons = {
      about: FaInfoCircle,
      terms: FaFileContract,
      privacy: FaShieldAlt,
      cookies: FaCookie
    };
    const Icon = icons[pageType] || FaInfoCircle;
    return <Icon className="text-[#00D4FF] w-6 h-6" />;
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {getIcon()}
            {pageLabel}
          </h2>
          <p className="text-gray-400 text-sm">
            {page ? `Last updated: ${new Date(page.updatedAt).toLocaleDateString()}` : 'No content yet'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00B4D8] transition-all"
              >
                <FaEdit className="w-4 h-4" />
                Edit Page
              </button>
              {page && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  <FaTrash className="w-4 h-4" />
                  Delete Page
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Display or Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Page Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder={`Enter ${pageLabel} title`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Content *
              <span className="text-xs text-gray-500 ml-2">(Use toolbar to format)</span>
            </label>
            <div className="bg-[#0A0A0F] rounded-lg border border-gray-700 overflow-hidden">
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder={`Write your ${pageLabel} content here...`}
                height="400px"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Excerpt (Short Description)</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
              placeholder="Brief description of this page..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* SEO Section */}
          <div className="border-t border-gray-700/50 pt-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">SEO Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={formData.seo?.title || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, title: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="SEO Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SEO Description</label>
                <textarea
                  value={formData.seo?.description || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, description: e.target.value }
                  })}
                  rows="2"
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="Meta description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SEO Keywords</label>
                <input
                  type="text"
                  value={formData.seo?.keywords?.join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: {
                      ...formData.seo,
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    }
                  })}
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all flex items-center justify-center gap-2"
            >
              <FaSave className="w-4 h-4" />
              {page ? `Update ${pageLabel}` : `Create ${pageLabel}`}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* Display Mode */
        <div className="bg-[#0A0A0F] rounded-xl p-6 border border-[#00D4FF]/10">
          {page ? (
            <>
              <h1 className="text-3xl font-bold text-white mb-4">{page.title}</h1>
              <div 
                className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-li:text-gray-300"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
              <div className="mt-6 pt-4 border-t border-[#00D4FF]/10">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>Status: <span className="text-white">{page.status}</span></span>
                  <span>Created: {new Date(page.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
                  <span>Slug: /{page.slug}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              {getIcon()}
              <p className="text-lg mt-4">No {pageLabel} page found</p>
              <p className="text-sm">Click "Edit Page" to create one</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PageManager;