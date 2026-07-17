// services/expenditureService.js
import api from './api';

export const expenditureService = {
  // Get all expenditures
  getExpenditures: async (params = {}) => {
    const response = await api.get('/expenditures', { params });
    return response.data;
  },

  // Get single expenditure
  getExpenditure: async (id) => {
    const response = await api.get(`/expenditures/${id}`);
    return response.data;
  },

  // Create expenditure
  createExpenditure: async (data) => {
    const response = await api.post('/expenditures', data);
    return response.data;
  },

  // Update expenditure
  updateExpenditure: async (id, data) => {
    const response = await api.put(`/expenditures/${id}`, data);
    return response.data;
  },

  // Delete expenditure
  deleteExpenditure: async (id) => {
    const response = await api.delete(`/expenditures/${id}`);
    return response.data;
  },

  // Process payment
  processPayment: async (id, data) => {
    const response = await api.put(`/expenditures/${id}/pay`, data);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/expenditures/stats');
    return response.data;
  }
};