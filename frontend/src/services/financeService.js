// services/financeService.js
import api from './api';

export const financeService = {
  // Company Finance
  getOverview: async () => {
    const response = await api.get('/finance/overview');
    return response.data;
  },

  getSalaryBreakdown: async (params = {}) => {
    const response = await api.get('/finance/salaries/breakdown', { params });
    return response.data;
  },

  updateShares: async (data) => {
    const response = await api.put('/finance/shares', data);
    return response.data;
  },

  addTransaction: async (data) => {
    const response = await api.post('/finance/transactions', data);
    return response.data;
  },

  // Salaries
  getSalaries: async (params = {}) => {
    const response = await api.get('/salaries', { params });
    return response.data;
  },

  createSalary: async (data) => {
    const response = await api.post('/salaries', data);
    return response.data;
  },

  getSalaryStats: async () => {
    const response = await api.get('/salaries/stats');
    return response.data;
  },

  processSalaryPayment: async (id, data) => {
    const response = await api.put(`/salaries/${id}/pay`, data);
    return response.data;
  }
};