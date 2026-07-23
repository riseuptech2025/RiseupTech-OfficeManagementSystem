// services/passwordManagerService.js
import api from './api';

export const passwordManagerService = {
  // Get all passwords
  getPasswords: async (params = {}) => {
    const response = await api.get('/passwords', { params });
    return response.data;
  },

  // Get single password
  getPassword: async (id) => {
    const response = await api.get(`/passwords/${id}`);
    return response.data;
  },

  // Create password
  createPassword: async (data) => {
    const response = await api.post('/passwords', data);
    return response.data;
  },

  // Update password
  updatePassword: async (id, data) => {
    const response = await api.put(`/passwords/${id}`, data);
    return response.data;
  },

  // Change password only
  changePassword: async (id, data) => {
    const response = await api.put(`/passwords/${id}/change-password`, data);
    return response.data;
  },

  // Share password
  sharePassword: async (id, data) => {
    const response = await api.post(`/passwords/${id}/share`, data);
    return response.data;
  },

  // Revoke access
  revokeAccess: async (id, userId) => {
    const response = await api.delete(`/passwords/${id}/share/${userId}`);
    return response.data;
  },

  // Delete password
  deletePassword: async (id) => {
    const response = await api.delete(`/passwords/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/passwords/stats');
    return response.data;
  }
};