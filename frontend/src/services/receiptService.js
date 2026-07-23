// services/receiptService.js
import api from './api';

export const receiptService = {
  generateReceipt: async (data) => {
    const response = await api.post('/receipts', data);
    return response.data;
  },

  getReceipts: async (params = {}) => {
    const response = await api.get('/receipts', { params });
    return response.data;
  },

  getReceipt: async (id) => {
    const response = await api.get(`/receipts/${id}`);
    return response.data;
  },

  getReceiptHistory: async (id) => {
    const response = await api.get(`/receipts/${id}/history`);
    return response.data;
  },

  editReceipt: async (id, data) => {
    const response = await api.put(`/receipts/${id}/edit`, data);
    return response.data;
  },

  markAsPaid: async (id, data = {}) => {
    const response = await api.put(`/receipts/${id}/pay`, data);
    return response.data;
  },

  makePartialPayment: async (id, data) => {
    const response = await api.post(`/receipts/${id}/pay-partial`, data);
    return response.data;
  },

  updateReceiptStatus: async (id, data) => {
    const response = await api.put(`/receipts/${id}/status`, data);
    return response.data;
  },

  deleteReceipt: async (id) => {
    const response = await api.delete(`/receipts/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/receipts/stats');
    return response.data;
  },

  downloadReceipt: async (id) => {
    const response = await api.put(`/receipts/${id}/download`);
    return response.data;
  }
};