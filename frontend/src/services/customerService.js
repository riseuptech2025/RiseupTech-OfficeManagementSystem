// services/customerService.js
import api from './api';

export const customerService = {
  createOrUpdateCustomer: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  getCustomers: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getCustomer: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  searchCustomer: async (phone) => {
    try {
      const response = await api.get(`/customers/search/${phone}`);
      return response.data;
    } catch (error) {
      // If customer not found, return null data
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }
      throw error;
    }
  }
};

export default customerService;