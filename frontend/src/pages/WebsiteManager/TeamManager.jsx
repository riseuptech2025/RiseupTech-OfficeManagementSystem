// src/pages/WebsiteManager/TeamManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch,
  FaUsers, FaSave, FaTimes, FaToggleOn, FaToggleOff,
  FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram,
  FaUpload, FaImage, FaTimesCircle
} from 'react-icons/fa';
import axios from 'axios';
import { authService } from '../../services/api';

const TeamManager = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    email: '',
    image: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      github: '',
      instagram: ''
    },
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/website/team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeam(response.data.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // IMAGE UPLOAD TO CLOUDINARY
  // ============================================
  // TeamManager.jsx - Updated handleImageUpload

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.log('No file selected');
    return;
  }

  console.log('File selected:', {
    name: file.name,
    type: file.type,
    size: file.size,
  });

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
    console.log('Token exists:', !!token);

    // Create FormData correctly
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'riseup-tech/team'); // Optional: specify folder

    // Log FormData contents for debugging
    for (let pair of formData.entries()) {
      console.log('FormData entry:', pair[0], pair[1]);
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/website/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        // Increase timeout for large files
        timeout: 60000,
      }
    );

    console.log('Upload response:', response.data);

    // Update form data with the uploaded image URL
    if (response.data.success && response.data.data?.url) {
      setFormData(prev => ({
        ...prev,
        image: response.data.data.url
      }));
      setImagePreview(response.data.data.url);
      console.log('Image uploaded successfully:', response.data.data.url);
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // More detailed error message
    let errorMessage = 'Failed to upload image';
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      console.error('No response received:', error.request);
      errorMessage = 'No response from server. Please check your connection.';
    }
    
    alert(errorMessage);
  } finally {
    setUploadingImage(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};

  // ============================================
  // REMOVE IMAGE
  // ============================================
  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const url = editingMember 
        ? `${import.meta.env.VITE_API_URL}/website/team/${editingMember._id}`
        : `${import.meta.env.VITE_API_URL}/website/team`;
      
      const method = editingMember ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      setEditingMember(null);
      setImagePreview(null);
      setFormData({
        name: '',
        position: '',
        bio: '',
        email: '',
        image: '',
        socialLinks: {
          facebook: '',
          twitter: '',
          linkedin: '',
          github: '',
          instagram: ''
        },
        order: 0,
        isActive: true
      });
      fetchTeam();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert(error.response?.data?.message || 'Error saving team member');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    
    try {
      const token = authService.getToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/website/team/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeam();
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Error deleting team member');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setImagePreview(member.image || null);
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      email: member.email || '',
      image: member.image || '',
      socialLinks: member.socialLinks || {
        facebook: '',
        twitter: '',
        linkedin: '',
        github: '',
        instagram: ''
      },
      order: member.order || 0,
      isActive: member.isActive !== undefined ? member.isActive : true
    });
    setShowModal(true);
  };

  const toggleStatus = async (member) => {
    try {
      const token = authService.getToken();
      await axios.put(`${import.meta.env.VITE_API_URL}/website/team/${member._id}`, {
        ...member,
        isActive: !member.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeam();
    } catch (error) {
      console.error('Error toggling member status:', error);
    }
  };

  const filteredTeam = team.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SocialIcon = ({ platform, url }) => {
    if (!url) return null;
    const icons = {
      facebook: FaFacebook,
      twitter: FaTwitter,
      linkedin: FaLinkedin,
      github: FaGithub,
      instagram: FaInstagram
    };
    const Icon = icons[platform];
    return Icon ? <Icon className="w-4 h-4 text-gray-400 hover:text-[#00D4FF] transition-colors" /> : null;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Members</h2>
          <p className="text-gray-400 text-sm">Manage your team</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            setImagePreview(null);
            setFormData({
              name: '',
              position: '',
              bio: '',
              email: '',
              image: '',
              socialLinks: {
                facebook: '',
                twitter: '',
                linkedin: '',
                github: '',
                instagram: ''
              },
              order: 0,
              isActive: true
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00B4D8] transition-all"
        >
          <FaPlus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Team List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaUsers className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No team members found</p>
          <p className="text-sm">Add your first team member</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.map((member) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#0A0A0F] rounded-xl p-4 border transition-all ${
                member.isActive 
                  ? 'border-[#00D4FF]/10 hover:border-[#00D4FF]/30' 
                  : 'border-gray-700/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white truncate">{member.name}</h3>
                    <button
                      onClick={() => toggleStatus(member)}
                      className="p-1 hover:bg-white/5 rounded transition-all"
                      title={member.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {member.isActive ? (
                        <FaToggleOn className="w-4 h-4 text-[#06D6A0]" />
                      ) : (
                        <FaToggleOff className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <p className="text-[#00D4FF] text-sm">{member.position}</p>
                  {member.email && (
                    <p className="text-gray-400 text-xs truncate">{member.email}</p>
                  )}
                  {member.bio && (
                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">{member.bio}</p>
                  )}
                  {member.socialLinks && Object.values(member.socialLinks).some(v => v) && (
                    <div className="flex gap-2 mt-2">
                      {Object.entries(member.socialLinks).map(([platform, url]) => (
                        <SocialIcon key={platform} platform={platform} url={url} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-all"
                    title="Edit Member"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    title="Delete Member"
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
              className="bg-[#111118] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#00D4FF]/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setImagePreview(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ============================================ */}
                {/* IMAGE UPLOAD SECTION - NEW */}
                {/* ============================================ */}
                <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-dashed border-[#00D4FF]/20">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Profile Image
                  </label>
                  
                  <div className="flex flex-col items-center gap-4">
                    {/* Image Preview */}
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Team member preview" 
                          className="w-32 h-32 rounded-full object-cover border-2 border-[#00D4FF]/30"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <FaTimesCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-[#0A0A0F] border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-500">
                        <FaImage className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex items-center gap-3 w-full">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
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
                            <FaUpload className="w-4 h-4" />
                            {imagePreview ? 'Change Image' : 'Upload Image'}
                          </>
                        )}
                      </label>
                      
                      {/* Image URL Input (Fallback) */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData({ ...formData, image: e.target.value });
                            setImagePreview(e.target.value);
                          }}
                          placeholder="Or paste image URL"
                          className="w-full px-3 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] text-sm"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Supported formats: JPEG, PNG, GIF, WEBP, SVG (Max 5MB)
                    </p>
                  </div>
                </div>

                {/* Rest of the form - unchanged */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Position *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Social Links</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaFacebook className="text-gray-400" />
                      <input
                        type="text"
                        value={formData.socialLinks?.facebook || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                        placeholder="Facebook URL"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTwitter className="text-gray-400" />
                      <input
                        type="text"
                        value={formData.socialLinks?.twitter || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FaLinkedin className="text-gray-400" />
                      <input
                        type="text"
                        value={formData.socialLinks?.linkedin || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FaGithub className="text-gray-400" />
                      <input
                        type="text"
                        value={formData.socialLinks?.github || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, github: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                        placeholder="GitHub URL"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FaInstagram className="text-gray-400" />
                      <input
                        type="text"
                        value={formData.socialLinks?.instagram || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                        })}
                        className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                        placeholder="Instagram URL"
                      />
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
                        {editingMember ? 'Update Member' : 'Add Member'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setImagePreview(null);
                    }}
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

export default TeamManager;