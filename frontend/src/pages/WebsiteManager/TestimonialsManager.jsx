// src/pages/WebsiteManager/TestimonialsManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch,
  FaComments, FaSave, FaTimes, FaToggleOn, FaToggleOff,
  FaStar, FaStarHalfAlt, FaRegStar
} from 'react-icons/fa';
import axios from 'axios';
import { authService } from '../../services/api';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clientName: '',
    clientPosition: '',
    clientCompany: '',
    clientImage: '',
    content: '',
    rating: 5,
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/website/testimonials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestimonials(response.data.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const url = editingTestimonial 
        ? `${import.meta.env.VITE_API_URL}/website/testimonials/${editingTestimonial._id}`
        : `${import.meta.env.VITE_API_URL}/website/testimonials`;
      
      const method = editingTestimonial ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      setEditingTestimonial(null);
      setFormData({
        clientName: '',
        clientPosition: '',
        clientCompany: '',
        clientImage: '',
        content: '',
        rating: 5,
        order: 0,
        isActive: true
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert(error.response?.data?.message || 'Error saving testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const token = authService.getToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/website/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Error deleting testimonial');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      clientName: testimonial.clientName,
      clientPosition: testimonial.clientPosition || '',
      clientCompany: testimonial.clientCompany || '',
      clientImage: testimonial.clientImage || '',
      content: testimonial.content,
      rating: testimonial.rating || 5,
      order: testimonial.order || 0,
      isActive: testimonial.isActive !== undefined ? testimonial.isActive : true
    });
    setShowModal(true);
  };

  const toggleStatus = async (testimonial) => {
    try {
      const token = authService.getToken();
      await axios.put(`${import.meta.env.VITE_API_URL}/website/testimonials/${testimonial._id}`, {
        ...testimonial,
        isActive: !testimonial.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling testimonial status:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const filteredTestimonials = testimonials.filter(t =>
    t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.clientCompany && t.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Testimonials</h2>
          <p className="text-gray-400 text-sm">Manage client testimonials</p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setFormData({
              clientName: '',
              clientPosition: '',
              clientCompany: '',
              clientImage: '',
              content: '',
              rating: 5,
              order: 0,
              isActive: true
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00B4D8] transition-all"
        >
          <FaPlus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search testimonials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaComments className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No testimonials found</p>
          <p className="text-sm">Add your first testimonial</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTestimonials.map((testimonial) => (
            <motion.div
              key={testimonial._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#0A0A0F] rounded-xl p-4 border transition-all ${
                testimonial.isActive 
                  ? 'border-[#00D4FF]/10 hover:border-[#00D4FF]/30' 
                  : 'border-gray-700/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                {testimonial.clientImage ? (
                  <img 
                    src={testimonial.clientImage} 
                    alt={testimonial.clientName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white text-xl font-bold">
                    {testimonial.clientName.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{testimonial.clientName}</h3>
                    <button
                      onClick={() => toggleStatus(testimonial)}
                      className="p-1 hover:bg-white/5 rounded transition-all"
                      title={testimonial.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {testimonial.isActive ? (
                        <FaToggleOn className="w-4 h-4 text-[#06D6A0]" />
                      ) : (
                        <FaToggleOff className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    {testimonial.clientPosition && <span>{testimonial.clientPosition}</span>}
                    {testimonial.clientPosition && testimonial.clientCompany && <span>•</span>}
                    {testimonial.clientCompany && <span>{testimonial.clientCompany}</span>}
                  </div>
                  <div className="flex items-center gap-1 my-2">
                    {renderStars(testimonial.rating)}
                    <span className="text-xs text-gray-500 ml-1">({testimonial.rating})</span>
                  </div>
                  <p className="text-gray-300 text-sm italic">"{testimonial.content}"</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-all"
                    title="Edit Testimonial"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial._id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    title="Delete Testimonial"
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
              className="bg-[#111118] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#00D4FF]/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
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
                    <label className="block text-sm font-medium text-gray-400 mb-1">Client Name *</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                    <input
                      type="text"
                      value={formData.clientPosition}
                      onChange={(e) => setFormData({ ...formData, clientPosition: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.clientCompany}
                    onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.clientImage}
                    onChange={(e) => setFormData({ ...formData, clientImage: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Testimonial Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Rating (1-5)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5 })}
                        className="w-20 px-3 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                      />
                      <div className="flex items-center gap-1">
                        {renderStars(formData.rating)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#00D4FF]"
                  />
                  <label className="text-sm text-gray-400">Active (visible on website)</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <FaSave className="w-4 h-4" />
                    {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
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

export default TestimonialsManager;