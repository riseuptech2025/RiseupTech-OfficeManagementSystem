import api from './api';

export const leaveService = {
  applyLeave: async (data) => {
    const response = await api.post('/leaves', data);
    return response.data;
  },

  getLeaves: async (params) => {
    const response = await api.get('/leaves', { params });
    return response.data;
  },

  getLeave: async (id) => {
    const response = await api.get(`/leaves/${id}`);
    return response.data;
  },

  updateLeaveStatus: async (id, data) => {
    const response = await api.put(`/leaves/${id}/status`, data);
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await api.post(`/leaves/${id}/comments`, { comment });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/leaves/stats');
    return response.data;
  }
};