// src/pages/WebsiteManager/PagesManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaSearch,
  FaFileAlt, FaSave, FaTimes, FaShieldAlt, FaCookie, 
  FaFileContract, FaInfoCircle, FaHandshake, FaFilter
} from 'react-icons/fa';
import axios from 'axios';
import { authService } from '../../services/api';
import RichTextEditor from '../../components/Common/RichTextEditor';

const PagesManager = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    type: 'page',
    status: 'draft',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

  // Page type options
  const pageTypes = [
    { value: 'page', label: 'Regular Page', icon: FaFileAlt },
    { value: 'about', label: 'About', icon: FaInfoCircle },
    { value: 'contact', label: 'Contact', icon: FaHandshake },
    { value: 'terms', label: 'Terms & Conditions', icon: FaFileContract },
    { value: 'privacy', label: 'Privacy Policy', icon: FaShieldAlt },
    { value: 'cookies', label: 'Cookies Policy', icon: FaCookie },
  ];

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/website/pages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const url = editingPage 
        ? `${import.meta.env.VITE_API_URL}/website/pages/${editingPage._id}`
        : `${import.meta.env.VITE_API_URL}/website/pages`;
      
      const method = editingPage ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      setEditingPage(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        type: 'page',
        status: 'draft',
        seo: {
          title: '',
          description: '',
          keywords: []
        }
      });
      fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      alert(error.response?.data?.message || 'Error saving page');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    
    try {
      const token = authService.getToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/website/pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Error deleting page');
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      content: page.content,
      excerpt: page.excerpt || '',
      type: page.type || 'page',
      status: page.status || 'draft',
      seo: page.seo || {
        title: '',
        description: '',
        keywords: []
      }
    });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: 'bg-green-500/20 text-green-400 border-green-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status] || colors.draft;
  };

  const getPageTypeLabel = (type) => {
    const found = pageTypes.find(t => t.value === type);
    return found ? found.label : 'Page';
  };

  const getPageTypeIcon = (type) => {
    const found = pageTypes.find(t => t.value === type);
    return found ? <found.icon className="text-[#00D4FF]" /> : <FaFileAlt className="text-[#00D4FF]" />;
  };

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || page.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaFileAlt className="text-[#00D4FF]" />
            All Pages
          </h2>
          <p className="text-gray-400 text-sm">Manage all your website pages</p>
        </div>
        <button
          onClick={() => {
            setEditingPage(null);
            setFormData({
              title: '',
              content: '',
              excerpt: '',
              type: 'page',
              status: 'draft',
              seo: {
                title: '',
                description: '',
                keywords: []
              }
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00B4D8] transition-all"
        >
          <FaPlus className="w-4 h-4" />
          New Page
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
        >
          <option value="all">All Types</option>
          {pageTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaFileAlt className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No pages found</p>
          <p className="text-sm">Create your first page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPages.map((page) => (
            <motion.div
              key={page._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A0A0F] rounded-xl p-4 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-[#00D4FF]">
                      {getPageTypeIcon(page.type)}
                    </span>
                    <h3 className="text-lg font-semibold text-white">{page.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(page.status)}`}>
                      {page.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20">
                      {getPageTypeLabel(page.type)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{page.excerpt || page.content.substring(0, 150)}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Slug: /{page.slug}</span>
                    <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                    className="p-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all"
                    title="View Page"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(page)}
                    className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-all"
                    title="Edit Page"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(page._id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    title="Delete Page"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111118] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#00D4FF]/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingPage ? 'Edit Page' : 'Create New Page'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Page Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                      placeholder="Enter page title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Page Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    >
                      {pageTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rich Text Editor for Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Content *
                    <span className="text-xs text-gray-500 ml-2">(Use toolbar to format)</span>
                  </label>
                  <div className="bg-[#0A0A0F] rounded-lg border border-gray-700 overflow-hidden">
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      placeholder="Write your page content here..."
                      height="350px"
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
                    {editingPage ? 'Update Page' : 'Create Page'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PagesManager;