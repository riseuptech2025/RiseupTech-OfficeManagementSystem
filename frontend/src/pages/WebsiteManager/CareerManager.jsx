// src/pages/WebsiteManager/CareerManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch,
  FaBriefcase, FaSave, FaTimes, FaToggleOn, FaToggleOff,
  FaMapMarkerAlt, FaClock, FaUsers, FaMoneyBillWave,
  FaStar, FaEye, FaDownload
} from 'react-icons/fa';
import axios from 'axios';
import { authService } from '../../services/api';

const CareerManager = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [editingCareer, setEditingCareer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [],
    responsibilities: [],
    benefits: [],
    location: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid',
    salaryRange: { min: 0, max: 0 },
    applicationDeadline: '',
    isActive: true,
    featured: false
  });

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/website/careers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCareers(response.data.data);
    } catch (error) {
      console.error('Error fetching careers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const url = editingCareer 
        ? `${import.meta.env.VITE_API_URL}/website/careers/${editingCareer._id}`
        : `${import.meta.env.VITE_API_URL}/website/careers`;
      
      const method = editingCareer ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowModal(false);
      setEditingCareer(null);
      setFormData({
        title: '',
        description: '',
        requirements: [],
        responsibilities: [],
        benefits: [],
        location: '',
        employmentType: 'Full-time',
        experienceLevel: 'Mid',
        salaryRange: { min: 0, max: 0 },
        applicationDeadline: '',
        isActive: true,
        featured: false
      });
      fetchCareers();
    } catch (error) {
      console.error('Error saving career:', error);
      alert(error.response?.data?.message || 'Error saving career');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    
    try {
      const token = authService.getToken();
      await axios.delete(`${import.meta.env.VITE_API_URL}/website/careers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCareers();
    } catch (error) {
      console.error('Error deleting career:', error);
      alert('Error deleting career');
    }
  };

  const handleEdit = (career) => {
    setEditingCareer(career);
    setFormData({
      title: career.title,
      description: career.description,
      requirements: career.requirements || [],
      responsibilities: career.responsibilities || [],
      benefits: career.benefits || [],
      location: career.location,
      employmentType: career.employmentType || 'Full-time',
      experienceLevel: career.experienceLevel || 'Mid',
      salaryRange: career.salaryRange || { min: 0, max: 0 },
      applicationDeadline: career.applicationDeadline ? new Date(career.applicationDeadline).toISOString().split('T')[0] : '',
      isActive: career.isActive !== undefined ? career.isActive : true,
      featured: career.featured || false
    });
    setShowModal(true);
  };

  const toggleStatus = async (career) => {
    try {
      const token = authService.getToken();
      await axios.put(`${import.meta.env.VITE_API_URL}/website/careers/${career._id}`, {
        ...career,
        isActive: !career.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCareers();
    } catch (error) {
      console.error('Error toggling career status:', error);
    }
  };

  const viewApplications = (career) => {
    setSelectedCareer(career);
    setShowApplications(true);
  };

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || career.isActive === (filterStatus === 'active');
    return matchesSearch && matchesStatus;
  });

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Manager'];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Careers</h2>
          <p className="text-gray-400 text-sm">Manage job postings</p>
        </div>
        <button
          onClick={() => {
            setEditingCareer(null);
            setFormData({
              title: '',
              description: '',
              requirements: [],
              responsibilities: [],
              benefits: [],
              location: '',
              employmentType: 'Full-time',
              experienceLevel: 'Mid',
              salaryRange: { min: 0, max: 0 },
              applicationDeadline: '',
              isActive: true,
              featured: false
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-white rounded-lg hover:bg-[#00B4D8] transition-all"
        >
          <FaPlus className="w-4 h-4" />
          New Job Posting
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search jobs..."
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
          <option value="all">All Jobs</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Careers List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="w-8 h-8 text-[#00D4FF] animate-spin" />
        </div>
      ) : filteredCareers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FaBriefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No job postings found</p>
          <p className="text-sm">Create your first job posting</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCareers.map((career) => (
            <motion.div
              key={career._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#0A0A0F] rounded-xl p-4 border transition-all ${
                career.isActive 
                  ? 'border-[#00D4FF]/10 hover:border-[#00D4FF]/30' 
                  : 'border-gray-700/50 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{career.title}</h3>
                    {career.featured && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        <FaStar className="inline mr-1" />
                        Featured
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      career.isActive 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {career.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{career.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="w-3 h-3" />
                      {career.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      {career.employmentType}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUsers className="w-3 h-3" />
                      {career.experienceLevel}
                    </span>
                    {career.salaryRange?.min > 0 && career.salaryRange?.max > 0 && (
                      <span className="flex items-center gap-1">
                        <FaMoneyBillWave className="w-3 h-3" />
                        Rs. {career.salaryRange.min} - {career.salaryRange.max}
                      </span>
                    )}
                    <span>Applications: {career.applications?.length || 0}</span>
                    {career.applicationDeadline && (
                      <span>Deadline: {new Date(career.applicationDeadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => viewApplications(career)}
                    className="p-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all"
                    title="View Applications"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStatus(career)}
                    className="p-2 bg-[#0A0A0F] rounded-lg hover:bg-white/5 transition-all"
                    title={career.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {career.isActive ? (
                      <FaToggleOn className="w-5 h-5 text-[#06D6A0]" />
                    ) : (
                      <FaToggleOff className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(career)}
                    className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-all"
                    title="Edit Job"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(career._id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                    title="Delete Job"
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
              className="bg-[#111118] rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#00D4FF]/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingCareer ? 'Edit Job Posting' : 'New Job Posting'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="4"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Employment Type</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    >
                      {employmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Experience Level</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    >
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Min Salary</label>
                    <input
                      type="number"
                      value={formData.salaryRange?.min || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        salaryRange: { ...formData.salaryRange, min: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Max Salary</label>
                    <input
                      type="number"
                      value={formData.salaryRange?.max || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        salaryRange: { ...formData.salaryRange, max: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Requirements (one per line)</label>
                  <textarea
                    value={formData.requirements?.join('\n') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      requirements: e.target.value.split('\n').filter(r => r.trim())
                    })}
                    rows="3"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    placeholder="Bachelor's degree in Computer Science&#10;3+ years of experience&#10;React and Node.js"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Responsibilities (one per line)</label>
                  <textarea
                    value={formData.responsibilities?.join('\n') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      responsibilities: e.target.value.split('\n').filter(r => r.trim())
                    })}
                    rows="3"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    placeholder="Develop and maintain web applications&#10;Collaborate with cross-functional teams&#10;Write clean, scalable code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Benefits (one per line)</label>
                  <textarea
                    value={formData.benefits?.join('\n') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      benefits: e.target.value.split('\n').filter(b => b.trim())
                    })}
                    rows="3"
                    className="w-full px-4 py-2 bg-[#0A0A0F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
                    placeholder="Health Insurance&#10;Flexible Working Hours&#10;Professional Development"
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

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#00D4FF]"
                  />
                  <label className="text-sm text-gray-400">Feature this job</label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <FaSave className="w-4 h-4" />
                    {editingCareer ? 'Update Job' : 'Create Job'}
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

      {/* Applications Modal */}
      <AnimatePresence>
        {showApplications && selectedCareer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111118] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#00D4FF]/20"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Applications</h3>
                  <p className="text-gray-400 text-sm">For: {selectedCareer.title}</p>
                </div>
                <button
                  onClick={() => setShowApplications(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              {selectedCareer.applications?.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCareer.applications.map((application, index) => (
                    <div key={index} className="bg-[#0A0A0F] rounded-xl p-4 border border-[#00D4FF]/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-semibold">{application.name}</h4>
                          <p className="text-gray-400 text-sm">{application.email}</p>
                          {application.phone && (
                            <p className="text-gray-400 text-sm">{application.phone}</p>
                          )}
                          {application.coverLetter && (
                            <p className="text-gray-400 text-sm mt-2">{application.coverLetter}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Applied: {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            application.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            application.status === 'shortlisted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            application.status === 'hired' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {application.status}
                          </span>
                          {application.resume && (
                            <a
                              href={application.resume}
                              download
                              className="p-2 bg-[#00D4FF]/10 text-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/20 transition-all"
                              title="Download Resume"
                            >
                              <FaDownload className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerManager;