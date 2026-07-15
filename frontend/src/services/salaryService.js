// services/salaryService.js
import api from './api';

export const salaryService = {
  // Get all salaries
  getSalaries: async (params = {}) => {
    const response = await api.get('/salaries', { params });
    return response.data;
  },

  // Create salary
  createSalary: async (data) => {
    const response = await api.post('/salaries', data);
    return response.data;
  },

  // Get salary statistics
  getSalaryStats: async () => {
    const response = await api.get('/salaries/stats');
    return response.data;
  },

  // Process salary payment
  processPayment: async (id, data) => {
    const response = await api.put(`/salaries/${id}/pay`, data);
    return response.data;
  },

  // Request advance salary
  requestAdvance: async (id, data) => {
    const response = await api.post(`/salaries/${id}/advance`, data);
    return response.data;
  },

  // Auto-generate salaries for next month
  autoGenerateSalaries: async () => {
    const response = await api.post('/salaries/auto-generate');
    return response.data;
  }
};