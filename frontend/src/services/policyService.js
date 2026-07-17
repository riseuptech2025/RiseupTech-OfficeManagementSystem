// services/policyService.js
import api from './api';

export const policyService = {
  // Get all policies
  getPolicies: async (params = {}) => {
    const response = await api.get('/policies', { params });
    return response.data;
  },

  // Get single policy
  getPolicy: async (id) => {
    const response = await api.get(`/policies/${id}`);
    return response.data;
  },

  // Create policy (Admin only)
  createPolicy: async (data) => {
    const response = await api.post('/policies', data);
    return response.data;
  },

  // Update policy (Admin only)
  updatePolicy: async (id, data) => {
    const response = await api.put(`/policies/${id}`, data);
    return response.data;
  },

  // Delete policy (Admin only)
  deletePolicy: async (id) => {
    const response = await api.delete(`/policies/${id}`);
    return response.data;
  },

  // Download policy (All users)
  downloadPolicy: async (id) => {
    const response = await api.put(`/policies/${id}/download`);
    return response.data;
  },

  // Add/Edit signature (All users)
  addSignature: async (id, data) => {
    const response = await api.post(`/policies/${id}/signatures`, data);
    return response.data;
  },

  // Get signatures (All users)
  getSignatures: async (id) => {
    const response = await api.get(`/policies/${id}/signatures`);
    return response.data;
  },

  // Remove signature (All users - only own signatures)
  removeSignature: async (id, signatureId) => {
    const response = await api.delete(`/policies/${id}/signatures/${signatureId}`);
    return response.data;
  },

  // Get next policy ID
  getNextPolicyId: async (appliesTo, category) => {
    const response = await api.get('/policies/next-id', {
      params: { appliesTo, category }
    });
    return response.data;
  },

  // Get employees by role
  getEmployeesByRole: async (role) => {
    const response = await api.get(`/policies/employees/${role}`);
    return response.data;
  }
};