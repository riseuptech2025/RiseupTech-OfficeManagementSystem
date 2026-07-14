import api from './api';

export const reportService = {
  createReport: async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
  },

  getReports: async (params) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  getReport: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  updateReportStatus: async (id, data) => {
    const response = await api.put(`/reports/${id}/status`, data);
    return response.data;
  },

  addComment: async (id, comment, isInternal = false) => {
    const response = await api.post(`/reports/${id}/comments`, { comment, isInternal });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  }
};