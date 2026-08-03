// src/pages/WebsiteManager/BlogsManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaSearch,
  FaBlog, FaSave, FaTimes, FaStar, FaUpload, FaImage, 
  FaTimesCircle, FaCloudUploadAlt
} from 'react-icons/fa';
import axios from 'axios';
import { authService } from '../../services/api';
import RichTextEditor from '../../components/Common/RichTextEditor';

const BlogsManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Technology',
    tags: [],
    status: 'draft',
    featured: false,
    featuredImage: '',
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/website/blogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(response.data.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // IMAGE UPLOAD TO CLOUDINARY
  // ============================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WEBP, SVG)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const token = authService.getToken();
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'riseup-tech/blogs');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/website/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          timeout: 60000,
        }
      );

      if (response.data.success && response.data.data?.url) {
        setFormData(prev => ({
          ...prev,
          featuredImage: response.data.data.url
        }));
        setImagePreview(response.data.data.url);
        console.log('Image uploaded successfully:', response.data.data.url);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(errorMessage);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      featuredImage: ''
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================
  // FORM HANDLING
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = authService.getToken();
      const url = editingBlog 
        ? `${import.meta.env.VITE_API_URL}/website/blogs/${editingBlog._id}`
        : `${import.meta.env.VITE_API_URL}/website/blogs`;
      
      const method = editingBlog ? 'put' : 'post';
      
      const dataToSend = {
        ...formData,
        tags: formData.tags || [],
        seo: {
          title: formData.seo?.title || '',
          description: formData.seo?.description || '',
          keywords: formData.seo?.keywords || []
        }
      };
      
      await axios[method](url, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      setEditingBlog(null);
      setImagePreview(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'Technology',
        tags: [],
        status: 'draft',
        featured: false,
        featuredImage: '',
        seo: {
          title: '',
          description: '',
          keywords: []
        }
      });
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      alert(error.response?.data?.message || 'Error saving blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      const token = authService.getToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/website/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setImagePreview(blog.featuredImage || null);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || '',
      category: blog.category || 'Technology',
      tags: blog.tags || [],
      status: blog.status || 'draft',
      featured: blog.featured || false,
      featuredImage: blog.featuredImage || '',
      seo: blog.seo || {
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

  const categories = ['Technology', 'Business', 'Development', 'Design', 'Marketing', 'News', 'Events'];

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Blogs</h2>
          <p className="text-gray-400 text-sm">Manage your blog posts</p>
        </div>
        <button
          onClick={() => {
            setEditingBlog(null);
            setImagePreview(null);
            setFormData({
              title: '',
              content: '',
              excerpt: '',
              category: 'Technology',
              tags: [],
              status: 'draft',
              featured: false,
              featuredImage: '',
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
          New Blog Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Blogs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaBlog className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No blog posts found</p>
          <p className="text-sm">Create your first blog post</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBlogs.map((blog) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A0A0F] rounded-xl p-4 border border-[#00D4FF]/10 hover:border-[#00D4FF]/30 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {/* Featured Image Preview in List */}
                    {blog.featuredImage && (
                      <img 
                        src={blog.featuredImage} 
                        alt={blog.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{blog.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(blog.status)}`}>
                          {blog.status}
                        </span>
                        {blog.featured && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <FaStar className="inline mr-1" />
                            Featured
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{blog.excerpt}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>By: {blog.authorName || 'Unknown'}</span>
                    <span>Views: {blog.views || 0}</span>
                    <span>Comments: {blog.comments?.length || 0}</span>
                    {blog.publishedAt && (
                      <span>Published: {new Date(blog.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => window.open(`/blogs/${blog.slug}`, '_blank')}
                    className="p-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all"
                    title="View Blog"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(blog)}
                    className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-all"
                    title="Edit Blog"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    title="Delete Blog"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal with Image Upload */}
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
                  {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
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
                    <label className="block text-sm font-medium text-gray-400 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ============================================ */}
                {/* IMAGE UPLOAD SECTION */}
                {/* ============================================ */}
                <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-dashed border-[#00D4FF]/20">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Featured Image
                  </label>
                  
                  <div className="flex flex-col items-center gap-4">
                    {/* Image Preview */}
                    {imagePreview ? (
                      <div className="relative w-full max-w-md mx-auto">
                        <img 
                          src={imagePreview} 
                          alt="Blog featured image preview" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-[#00D4FF]/30"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          title="Remove image"
                        >
                          <FaTimesCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full max-w-md h-48 bg-[#0A0A0F] border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500">
                        <FaImage className="w-12 h-12 mb-3 opacity-50" />
                        <span className="text-sm">No image uploaded</span>
                        <span className="text-xs text-gray-600">Click "Upload Image" to add one</span>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex flex-wrap items-center gap-3 w-full max-w-md">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="blog-image-upload"
                      />
                      <label
                        htmlFor="blog-image-upload"
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                          uploadingImage
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 border border-[#00D4FF]/20'
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <FaSpinner className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FaCloudUploadAlt className="w-4 h-4" />
                            {imagePreview ? 'Change Image' : 'Upload Image'}
                          </>
                        )}
                      </label>
                      
                      {/* Image URL Input (Fallback) */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.featuredImage}
                          onChange={(e) => {
                            setFormData({ ...formData, featuredImage: e.target.value });
                            setImagePreview(e.target.value);
                          }}
                          placeholder="Or paste image URL"
                          className="w-full px-3 py-2.5 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Supported formats: JPEG, PNG, GIF, WEBP, SVG (Max 5MB)
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Content *</label>
                  <div className="bg-[#0A0A0F] rounded-lg border border-gray-700 overflow-hidden">
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      placeholder="Write your blog post content here..."
                      height="350px"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Excerpt *</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    required
                    rows="3"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    })}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    placeholder="react, javascript, web development"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 accent-[#00D4FF]"
                    />
                    <label className="text-sm text-gray-400">Feature this post</label>
                  </div>
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
                    disabled={uploadingImage}
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Uploading Image...
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        {editingBlog ? 'Update Blog' : 'Create Blog'}
                      </>
                    )}
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

export default BlogsManager;