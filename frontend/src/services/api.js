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
// DEFAULT EXPORT
// ============================================
export default api;