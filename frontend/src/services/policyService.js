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

  // Create policy
  createPolicy: async (data) => {
    const response = await api.post('/policies', data);
    return response.data;
  },

  // Update policy
  updatePolicy: async (id, data) => {
    const response = await api.put(`/policies/${id}`, data);
    return response.data;
  },

  // Delete policy
  deletePolicy: async (id) => {
    const response = await api.delete(`/policies/${id}`);
    return response.data;
  },

  // Download policy
  downloadPolicy: async (id) => {
    const response = await api.put(`/policies/${id}/download`);
    return response.data;
  },

  // Add signature
  addSignature: async (id, data) => {
    const response = await api.post(`/policies/${id}/signatures`, data);
    return response.data;
  },

  // Get next policy ID
  getNextPolicyId: async (appliesTo, category) => {
    const response = await api.get('/policies/next-id', {
      params: { appliesTo, category }
    });
    return response.data;
  },

  // Get approval authority user
  getApprovalUser: async (authority) => {
    const response = await api.get(`/policies/approval-user/${authority}`);
    return response.data;
  },

  // Get employees by role
  getEmployeesByRole: async (role) => {
    const response = await api.get(`/policies/employees/${role}`);
    return response.data;
  }
};