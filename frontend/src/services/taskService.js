import api from './api';

export const taskService = {
  createTask: async (data) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  getTasks: async (params) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  updateSubtask: async (taskId, subtaskIndex, completed) => {
    const response = await api.put(`/tasks/${taskId}/subtasks/${subtaskIndex}`, { completed });
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await api.post(`/tasks/${id}/comments`, { comment });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/tasks/stats');
    return response.data;
  }
};