// website-frontend/src/services/api.js
import axios from 'axios';

// ============================================
// API URL Configuration
// ============================================
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://riseup-tech-backend.vercel.app/api';
  }
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔧 Website API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('📤 Website API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: config.baseURL + config.url,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('📥 Website API Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error('❌ Website API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// ============================================
// WEBSITE SERVICES
// ============================================
export const websiteService = {
  // Pages
  getPageBySlug: async (slug) => {
    try {
      const response = await api.get(`/website/pages/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get page by slug error:', error);
      throw error;
    }
  },

  // Blogs
  getBlogs: async (params = {}) => {
    try {
      const response = await api.get('/website/blogs', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Get blogs error:', error);
      throw error;
    }
  },

  getBlogBySlug: async (slug) => {
    try {
      const response = await api.get(`/website/blogs/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get blog by slug error:', error);
      throw error;
    }
  },

  // Services
  getServices: async (params = {}) => {
    try {
      const response = await api.get('/website/services', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Get services error:', error);
      throw error;
    }
  },

  getServiceBySlug: async (slug) => {
    try {
      const response = await api.get(`/website/services/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get service by slug error:', error);
      throw error;
    }
  },

  // Team
  getTeam: async () => {
    try {
      const response = await api.get('/website/team');
      return response.data;
    } catch (error) {
      console.error('❌ Get team error:', error);
      throw error;
    }
  },

  // Testimonials
  getTestimonials: async () => {
    try {
      const response = await api.get('/website/testimonials');
      return response.data;
    } catch (error) {
      console.error('❌ Get testimonials error:', error);
      throw error;
    }
  },

  // Careers
  getCareers: async (params = {}) => {
    try {
      const response = await api.get('/website/careers', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Get careers error:', error);
      throw error;
    }
  },

  getCareerBySlug: async (slug) => {
    try {
      const response = await api.get(`/website/careers/slug/${slug}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get career by slug error:', error);
      throw error;
    }
  },

  applyForCareer: async (id, data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'resume' && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key]);
        }
      });
      
      const response = await api.post(`/website/careers/${id}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Apply for career error:', error);
      throw error;
    }
  },

  // Contact
  submitContact: async (data) => {
    try {
      const response = await api.post('/website/contacts', data);
      return response.data;
    } catch (error) {
      console.error('❌ Submit contact error:', error);
      throw error;
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const response = await api.get('/website/settings');
      return response.data;
    } catch (error) {
      console.error('❌ Get settings error:', error);
      throw error;
    }
  },
};

export default api;