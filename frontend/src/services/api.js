import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for file uploads
});

// ============================================
// Request Interceptor
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging (remove in production)
    if (config.data && !(config.data instanceof FormData)) {
      console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
    } else if (config.data instanceof FormData) {
      console.log('API Request:', config.method.toUpperCase(), config.url, 'FormData');
    } else {
      console.log('API Request:', config.method.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token expired, logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        console.log('Login successful');
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logged out');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // ============================================
  // ADDED: getToken method for components that need it
  // ============================================
  getToken: () => {
    return localStorage.getItem('token');
  },

  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  updateUserInStorage: (userData) => {
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },
};

// ============================================
// USER SERVICE
// ============================================
export const userService = {
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  getUser: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      console.log('Creating user with data:', userData);
      const response = await api.post('/users', userData);
      console.log('User created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      console.log('Updating user with data:', userData);
      const response = await api.put(`/users/${id}`, userData);
      console.log('User updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      console.log('User deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },
};

// ============================================
// PROFILE SERVICE
// ============================================
export const profileService = {
  getProfile: async () => {
    try {
      const response = await api.get('/profile/me');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      console.log('Updating profile with data:', profileData);
      const response = await api.put('/profile/me', profileData);
      console.log('Profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Upload profile picture using FormData (for file upload)
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      console.log('Profile picture uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      console.log('Changing password');
      const response = await api.put('/profile/change-password', passwordData);
      console.log('Password changed successfully');
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  deleteProfilePicture: async () => {
    try {
      const response = await api.delete('/profile/picture');
      console.log('Profile picture deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Delete profile picture error:', error);
      throw error;
    }
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================
export const dashboardService = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  getRecentUsers: async () => {
    try {
      const response = await api.get('/dashboard/recent-users');
      return response.data;
    } catch (error) {
      console.error('Get recent users error:', error);
      throw error;
    }
  },

  getActivity: async () => {
    try {
      const response = await api.get('/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Get activity error:', error);
      throw error;
    }
  },
};

// ============================================
// WEBSITE SERVICE (NEW)
// ============================================
export const websiteService = {
  // Pages
  getPages: async () => {
    try {
      const response = await api.get('/website/pages');
      return response.data;
    } catch (error) {
      console.error('Get pages error:', error);
      throw error;
    }
  },

  getPage: async (id) => {
    try {
      const response = await api.get(`/website/pages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get page error:', error);
      throw error;
    }
  },

  getPageBySlug: async (slug) => {
    try {
      const response = await api.get(`/website/pages/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Get page by slug error:', error);
      throw error;
    }
  },

  createPage: async (data) => {
    try {
      const response = await api.post('/website/pages', data);
      return response.data;
    } catch (error) {
      console.error('Create page error:', error);
      throw error;
    }
  },

  updatePage: async (id, data) => {
    try {
      const response = await api.put(`/website/pages/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update page error:', error);
      throw error;
    }
  },

  deletePage: async (id) => {
    try {
      const response = await api.delete(`/website/pages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete page error:', error);
      throw error;
    }
  },

  // Blogs
  getBlogs: async () => {
    try {
      const response = await api.get('/website/blogs');
      return response.data;
    } catch (error) {
      console.error('Get blogs error:', error);
      throw error;
    }
  },

  getBlog: async (id) => {
    try {
      const response = await api.get(`/website/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get blog error:', error);
      throw error;
    }
  },

  getBlogBySlug: async (slug) => {
    try {
      const response = await api.get(`/website/blogs/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Get blog by slug error:', error);
      throw error;
    }
  },

  createBlog: async (data) => {
    try {
      const response = await api.post('/website/blogs', data);
      return response.data;
    } catch (error) {
      console.error('Create blog error:', error);
      throw error;
    }
  },

  updateBlog: async (id, data) => {
    try {
      const response = await api.put(`/website/blogs/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update blog error:', error);
      throw error;
    }
  },

  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`/website/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete blog error:', error);
      throw error;
    }
  },

  // Services
  getServices: async () => {
    try {
      const response = await api.get('/website/services');
      return response.data;
    } catch (error) {
      console.error('Get services error:', error);
      throw error;
    }
  },

  getService: async (id) => {
    try {
      const response = await api.get(`/website/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get service error:', error);
      throw error;
    }
  },

  createService: async (data) => {
    try {
      const response = await api.post('/website/services', data);
      return response.data;
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  },

  updateService: async (id, data) => {
    try {
      const response = await api.put(`/website/services/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  },

  deleteService: async (id) => {
    try {
      const response = await api.delete(`/website/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  },

  // Team
  getTeam: async () => {
    try {
      const response = await api.get('/website/team');
      return response.data;
    } catch (error) {
      console.error('Get team error:', error);
      throw error;
    }
  },

  createTeamMember: async (data) => {
    try {
      const response = await api.post('/website/team', data);
      return response.data;
    } catch (error) {
      console.error('Create team member error:', error);
      throw error;
    }
  },

  updateTeamMember: async (id, data) => {
    try {
      const response = await api.put(`/website/team/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update team member error:', error);
      throw error;
    }
  },

  deleteTeamMember: async (id) => {
    try {
      const response = await api.delete(`/website/team/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete team member error:', error);
      throw error;
    }
  },

  // Testimonials
  getTestimonials: async () => {
    try {
      const response = await api.get('/website/testimonials');
      return response.data;
    } catch (error) {
      console.error('Get testimonials error:', error);
      throw error;
    }
  },

  createTestimonial: async (data) => {
    try {
      const response = await api.post('/website/testimonials', data);
      return response.data;
    } catch (error) {
      console.error('Create testimonial error:', error);
      throw error;
    }
  },

  updateTestimonial: async (id, data) => {
    try {
      const response = await api.put(`/website/testimonials/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update testimonial error:', error);
      throw error;
    }
  },

  deleteTestimonial: async (id) => {
    try {
      const response = await api.delete(`/website/testimonials/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete testimonial error:', error);
      throw error;
    }
  },

  // Careers
  getCareers: async () => {
    try {
      const response = await api.get('/website/careers');
      return response.data;
    } catch (error) {
      console.error('Get careers error:', error);
      throw error;
    }
  },

  getCareer: async (id) => {
    try {
      const response = await api.get(`/website/careers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get career error:', error);
      throw error;
    }
  },

  createCareer: async (data) => {
    try {
      const response = await api.post('/website/careers', data);
      return response.data;
    } catch (error) {
      console.error('Create career error:', error);
      throw error;
    }
  },

  updateCareer: async (id, data) => {
    try {
      const response = await api.put(`/website/careers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update career error:', error);
      throw error;
    }
  },

  deleteCareer: async (id) => {
    try {
      const response = await api.delete(`/website/careers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete career error:', error);
      throw error;
    }
  },

  applyForCareer: async (id, data) => {
    try {
      const response = await api.post(`/website/careers/${id}/apply`, data);
      return response.data;
    } catch (error) {
      console.error('Apply for career error:', error);
      throw error;
    }
  },

  // Contacts
  getContacts: async () => {
    try {
      const response = await api.get('/website/contacts');
      return response.data;
    } catch (error) {
      console.error('Get contacts error:', error);
      throw error;
    }
  },

  submitContact: async (data) => {
    try {
      const response = await api.post('/website/contacts', data);
      return response.data;
    } catch (error) {
      console.error('Submit contact error:', error);
      throw error;
    }
  },

  updateContactStatus: async (id, data) => {
    try {
      const response = await api.put(`/website/contacts/${id}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Update contact status error:', error);
      throw error;
    }
  },

  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/website/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete contact error:', error);
      throw error;
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const response = await api.get('/website/settings');
      return response.data;
    } catch (error) {
      console.error('Get settings error:', error);
      throw error;
    }
  },

  updateSettings: async (data) => {
    try {
      const response = await api.put('/website/settings', data);
      return response.data;
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  },

  // Upload
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/website/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  }
};

// ============================================
// RECEIPT SERVICE (for completeness)
// ============================================
export const receiptService = {
  generateReceipt: async (data) => {
    try {
      const response = await api.post('/receipts', data);
      return response.data;
    } catch (error) {
      console.error('Generate receipt error:', error);
      throw error;
    }
  },

  getReceipts: async (params = {}) => {
    try {
      const response = await api.get('/receipts', { params });
      return response.data;
    } catch (error) {
      console.error('Get receipts error:', error);
      throw error;
    }
  },

  getReceipt: async (id) => {
    try {
      const response = await api.get(`/receipts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get receipt error:', error);
      throw error;
    }
  },

  editReceipt: async (id, data) => {
    try {
      const response = await api.put(`/receipts/${id}/edit`, data);
      return response.data;
    } catch (error) {
      console.error('Edit receipt error:', error);
      throw error;
    }
  },

  markAsPaid: async (id, data = {}) => {
    try {
      const response = await api.put(`/receipts/${id}/pay`, data);
      return response.data;
    } catch (error) {
      console.error('Mark as paid error:', error);
      throw error;
    }
  },

  makePartialPayment: async (id, data) => {
    try {
      const response = await api.post(`/receipts/${id}/pay-partial`, data);
      return response.data;
    } catch (error) {
      console.error('Make partial payment error:', error);
      throw error;
    }
  },

  updateReceiptStatus: async (id, data) => {
    try {
      const response = await api.put(`/receipts/${id}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Update receipt status error:', error);
      throw error;
    }
  },

  deleteReceipt: async (id) => {
    try {
      const response = await api.delete(`/receipts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete receipt error:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/receipts/stats');
      return response.data;
    } catch (error) {
      console.error('Get receipt stats error:', error);
      throw error;
    }
  },

  downloadReceipt: async (id) => {
    try {
      const response = await api.put(`/receipts/${id}/download`);
      return response.data;
    } catch (error) {
      console.error('Download receipt error:', error);
      throw error;
    }
  },

  getReceiptHistory: async (id) => {
    try {
      const response = await api.get(`/receipts/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Get receipt history error:', error);
      throw error;
    }
  }
};

// ============================================
// DEFAULT EXPORT
// ============================================
export default api;