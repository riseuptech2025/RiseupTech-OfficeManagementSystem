import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendar, 
  FaIdCard, 
  FaBuilding,
  FaEdit,
  FaSave,
  FaTimes,
  FaKey,
  FaUserCircle,
  FaCamera,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaGraduationCap,
  FaBriefcase,
  FaHeart,
  FaCode,
  FaMapMarkerAlt,
  FaVenusMars,
  FaFlag,
  FaPhoneAlt,
  FaUserPlus,
  FaPlus,
  FaTrash,
  FaEdit as FaEditIcon,
  FaSave as FaSaveIcon,
  FaTimes as FaTimesIcon,
  FaUpload,
  FaImage,
} from 'react-icons/fa';
import { authService, profileService } from '../services/api';
import CompanyLogo from '../components/CompanyLogo';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    department: '',
    about: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    maritalStatus: 'prefer-not-to-say',
    nationality: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    education: [],
    experience: [],
    socialMedia: {
      linkedin: '',
      github: '',
      twitter: '',
      facebook: '',
      instagram: '',
      youtube: '',
      website: '',
    },
    hobbies: [],
    skills: [],
  });

  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    year: '',
    description: '',
  });

  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [newHobby, setNewHobby] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileService.getProfile();
      const userData = response.data;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        age: userData.age || '',
        phone: userData.phone || '',
        department: userData.department || '',
        about: userData.about || '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        gender: userData.gender || 'prefer-not-to-say',
        maritalStatus: userData.maritalStatus || 'prefer-not-to-say',
        nationality: userData.nationality || '',
        address: userData.address || { street: '', city: '', state: '', country: '', zipCode: '' },
        emergencyContact: userData.emergencyContact || { name: '', relationship: '', phone: '' },
        education: userData.education || [],
        experience: userData.experience || [],
        socialMedia: userData.socialMedia || { linkedin: '', github: '', twitter: '', facebook: '', instagram: '', youtube: '', website: '' },
        hobbies: userData.hobbies || [],
        skills: userData.skills || [],
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      if (error.response?.status === 401) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value,
      },
    }));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    setNewExperience(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution && newEducation.year) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation }],
      }));
      setNewEducation({ degree: '', institution: '', year: '', description: '' });
    } else {
      setError('Please fill in degree, institution, and year');
    }
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addExperience = () => {
    if (newExperience.company && newExperience.position && newExperience.startDate) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience }],
      }));
      setNewExperience({ company: '', position: '', startDate: '', endDate: '', description: '' });
    } else {
      setError('Please fill in company, position, and start date');
    }
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addHobby = () => {
    if (newHobby.trim()) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()],
      }));
      setNewHobby('');
    }
  };

  const removeHobby = (index) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter((_, i) => i !== index),
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await profileService.updateProfile(formData);
      setUser(response.data);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      // Update stored user data
      const storedUser = authService.getUser();
      if (storedUser) {
        storedUser.name = response.data.name;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // FIXED: Image Upload Handler
  // ============================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Send the file directly - NOT base64
      const response = await profileService.uploadProfilePicture(file);
      setUser(response.data);
      setSuccess('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully!');
      setChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      ceo: 'bg-red-500/20 text-red-400 border-red-500/30',
      coo: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      hr_manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      accountant: 'bg-green-500/20 text-green-400 border-green-500/30',
      staff: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[role] || colors.staff;
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'super_admin': return '👑';
      case 'ceo': return '💼';
      case 'coo': return '📊';
      case 'hr_manager': return '👥';
      case 'accountant': return '💰';
      default: return '👤';
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <FaSpinner className="w-12 h-12 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Profile Header */}
        <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <button 
                className="absolute bottom-0 right-0 p-2.5 bg-[#00D4FF] rounded-full hover:bg-[#00D4FF]/80 transition-all shadow-lg shadow-[#00D4FF]/20"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <FaSpinner className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <FaCamera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 justify-center md:justify-start">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadge(user?.role)}`}>
                  {getRoleIcon(user?.role)} {user?.role}
                </span>
                <span className="text-sm text-gray-400">{user?.employeeId}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <FaEnvelope className="w-4 h-4 text-[#00D4FF]" />
                  {user?.email}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <FaPhone className="w-4 h-4 text-[#00D4FF]" />
                    {user?.phone}
                  </span>
                )}
                {user?.department && (
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <FaBuilding className="w-4 h-4 text-[#00D4FF]" />
                    {user?.department}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 min-w-[140px]">
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-colors border border-[#00D4FF]/20 flex items-center justify-center gap-2"
              >
                {editing ? <FaTimes className="w-4 h-4" /> : <FaEdit className="w-4 h-4" />}
                {editing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
              <button
                onClick={() => setChangingPassword(!changingPassword)}
                className="px-4 py-2 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg hover:bg-[#7C3AED]/20 transition-colors border border-[#7C3AED]/20 flex items-center justify-center gap-2"
              >
                <FaKey className="w-4 h-4" />
                {changingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
            >
              <FaCheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
            >
              <FaExclamationTriangle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change Password Form */}
        {changingPassword && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaKey className="text-[#7C3AED]" />
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-[#7C3AED] to-[#00D4FF] text-white rounded-lg hover:shadow-lg hover:shadow-[#7C3AED]/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {saving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaKey className="w-4 h-4" />}
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setChangingPassword(false)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Profile Edit Form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-2 bg-[#0A0A0F]/50 text-gray-500 border border-gray-700 rounded-lg cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
              </div>

              {/* About */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">About Me</label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Street</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Relationship</label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Education Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Education</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    name="degree"
                    value={newEducation.degree}
                    onChange={handleEducationChange}
                    placeholder="Degree"
                    className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="institution"
                    value={newEducation.institution}
                    onChange={handleEducationChange}
                    placeholder="Institution"
                    className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="year"
                      value={newEducation.year}
                      onChange={handleEducationChange}
                      placeholder="Year"
                      className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addEducation}
                      className="px-3 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00D4FF]/80 transition-colors"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#0A0A0F]/50 p-3 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{edu.degree}</p>
                        <p className="text-sm text-gray-400">{edu.institution} - {edu.year}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Work Experience</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    name="company"
                    value={newExperience.company}
                    onChange={handleExperienceChange}
                    placeholder="Company"
                    className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                  <input
                    type="text"
                    name="position"
                    value={newExperience.position}
                    onChange={handleExperienceChange}
                    placeholder="Position"
                    className="px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="startDate"
                      value={newExperience.startDate}
                      onChange={handleExperienceChange}
                      placeholder="Start Date"
                      className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addExperience}
                      className="px-3 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00D4FF]/80 transition-colors"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#0A0A0F]/50 p-3 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{exp.position}</p>
                        <p className="text-sm text-gray-400">{exp.company} - {exp.startDate} to {exp.endDate || 'Present'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Skills</h4>
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill..."
                    className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00D4FF]/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="flex items-center gap-2 px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] rounded-full border border-[#00D4FF]/20">
                      <FaCode className="w-3 h-3" />
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Hobbies Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Hobbies & Interests</h4>
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHobby()}
                    placeholder="Add a hobby..."
                    className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addHobby}
                    className="px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00D4FF]/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.hobbies.map((hobby, index) => (
                    <span key={index} className="flex items-center gap-2 px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full border border-[#7C3AED]/20">
                      <FaHeart className="w-3 h-3" />
                      {hobby}
                      <button
                        type="button"
                        onClick={() => removeHobby(index)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FaLinkedin className="text-[#0A66C2] w-5 h-5" />
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.socialMedia.linkedin}
                      onChange={handleSocialMediaChange}
                      placeholder="LinkedIn URL"
                      className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaGithub className="text-white w-5 h-5" />
                    <input
                      type="url"
                      name="github"
                      value={formData.socialMedia.github}
                      onChange={handleSocialMediaChange}
                      placeholder="GitHub URL"
                      className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaTwitter className="text-[#1DA1F2] w-5 h-5" />
                    <input
                      type="url"
                      name="twitter"
                      value={formData.socialMedia.twitter}
                      onChange={handleSocialMediaChange}
                      placeholder="Twitter URL"
                      className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaFacebook className="text-[#1877F2] w-5 h-5" />
                    <input
                      type="url"
                      name="facebook"
                      value={formData.socialMedia.facebook}
                      onChange={handleSocialMediaChange}
                      placeholder="Facebook URL"
                      className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaInstagram className="text-[#E4405F] w-5 h-5" />
                    <input
                      type="url"
                      name="instagram"
                      value={formData.socialMedia.instagram}
                      onChange={handleSocialMediaChange}
                      placeholder="Instagram URL"
                      className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaYoutube className="text-[#FF0000] w-5 h-5" />
                    <input
                      type="url"
                      name="youtube"
                      value={formData.socialMedia.youtube}
                      onChange={handleSocialMediaChange}
                      placeholder="YouTube URL"
                      className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <FaGlobe className="text-[#00D4FF] w-5 h-5" />
                    <input
                      type="url"
                      name="website"
                      value={formData.socialMedia.website}
                      onChange={handleSocialMediaChange}
                      placeholder="Personal Website URL"
                      className="flex-1 px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {saving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSave className="w-4 h-4" />}
                  Save All Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Profile Display Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6">
            <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
              <FaUser className="text-[#00D4FF]" />
              Personal Information
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Employee ID</span>
                <span className="text-white">{user?.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="text-white">{user?.phone || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Age</span>
                <span className="text-white">{user?.age || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gender</span>
                <span className="text-white capitalize">{user?.gender?.replace('-', ' ') || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Marital Status</span>
                <span className="text-white capitalize">{user?.maritalStatus?.replace('-', ' ') || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nationality</span>
                <span className="text-white">{user?.nationality || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Department</span>
                <span className="text-white">{user?.department || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user?.role)}`}>
                  {getRoleIcon(user?.role)} {user?.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user?.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Joined</span>
                <span className="text-white">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* About & Address Card */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <FaUserCircle className="text-[#00D4FF]" />
                About Me
              </h4>
              <p className="text-white">{user?.about || 'No about information provided'}</p>
            </div>

            {/* Address */}
            {(user?.address?.street || user?.address?.city || user?.address?.country) && (
              <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#00D4FF]" />
                  Address
                </h4>
                <div className="space-y-2 text-white">
                  {user?.address?.street && <p>{user.address.street}</p>}
                  <p>
                    {user?.address?.city && user.address.city}
                    {user?.address?.state && `, ${user.address.state}`}
                    {user?.address?.zipCode && `, ${user.address.zipCode}`}
                  </p>
                  {user?.address?.country && <p>{user.address.country}</p>}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {user?.emergencyContact?.name && (
              <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                  <FaPhoneAlt className="text-[#00D4FF]" />
                  Emergency Contact
                </h4>
                <div className="space-y-2 text-white">
                  <p><span className="text-gray-400">Name:</span> {user.emergencyContact.name}</p>
                  <p><span className="text-gray-400">Relationship:</span> {user.emergencyContact.relationship}</p>
                  <p><span className="text-gray-400">Phone:</span> {user.emergencyContact.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Education Card */}
          {user?.education && user.education.length > 0 && (
            <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <FaGraduationCap className="text-[#00D4FF]" />
                Education
              </h4>
              <div className="space-y-4">
                {user.education.map((edu, index) => (
                  <div key={index} className="border-b border-gray-700/50 last:border-0 pb-4 last:pb-0">
                    <p className="text-white font-medium">{edu.degree}</p>
                    <p className="text-sm text-gray-400">{edu.institution}</p>
                    <p className="text-xs text-gray-500">{edu.year}</p>
                    {edu.description && <p className="text-sm text-gray-400 mt-1">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Card */}
          {user?.experience && user.experience.length > 0 && (
            <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <FaBriefcase className="text-[#00D4FF]" />
                Work Experience
              </h4>
              <div className="space-y-4">
                {user.experience.map((exp, index) => (
                  <div key={index} className="border-b border-gray-700/50 last:border-0 pb-4 last:pb-0">
                    <p className="text-white font-medium">{exp.position}</p>
                    <p className="text-sm text-gray-400">{exp.company}</p>
                    <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</p>
                    {exp.description && <p className="text-sm text-gray-400 mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Card */}
          {user?.skills && user.skills.length > 0 && (
            <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <FaCode className="text-[#00D4FF]" />
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] rounded-full border border-[#00D4FF]/20 text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies Card */}
          {user?.hobbies && user.hobbies.length > 0 && (
            <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <FaHeart className="text-[#00D4FF]" />
                Hobbies & Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.hobbies.map((hobby, index) => (
                  <span key={index} className="px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full border border-[#7C3AED]/20 text-sm">
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Media Card */}
          {user?.socialMedia && Object.values(user.socialMedia).some(val => val) && (
            <div className="bg-[#111118]/80 backdrop-blur-xl rounded-2xl border border-[#00D4FF]/10 p-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <FaGlobe className="text-[#00D4FF]" />
                Social Media
              </h4>
              <div className="space-y-3">
                {user.socialMedia.linkedin && (
                  <a href={user.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-[#0A66C2] transition-colors">
                    <FaLinkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {user.socialMedia.github && (
                  <a href={user.socialMedia.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-gray-400 transition-colors">
                    <FaGithub className="w-5 h-5" />
                    <span>GitHub</span>
                  </a>
                )}
                {user.socialMedia.twitter && (
                  <a href={user.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-[#1DA1F2] transition-colors">
                    <FaTwitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </a>
                )}
                {user.socialMedia.facebook && (
                  <a href={user.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-[#1877F2] transition-colors">
                    <FaFacebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </a>
                )}
                {user.socialMedia.instagram && (
                  <a href={user.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-[#E4405F] transition-colors">
                    <FaInstagram className="w-5 h-5" />
                    <span>Instagram</span>
                  </a>
                )}
                {user.socialMedia.youtube && (
                  <a href={user.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-[#FF0000] transition-colors">
                    <FaYoutube className="w-5 h-5" />
                    <span>YouTube</span>
                  </a>
                )}
                {user.socialMedia.website && (
                  <a href={user.socialMedia.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white hover:text-[#00D4FF] transition-colors">
                    <FaGlobe className="w-5 h-5" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;