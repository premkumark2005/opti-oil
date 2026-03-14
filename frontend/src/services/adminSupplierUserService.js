import api from './api';

const adminSupplierUserService = {
  // Get all supplier users
  getAll: async (params = {}) => {
    const response = await api.get('/admin/supplier-users', { params });
    return response.data;
  },

  // Get supplier user by ID
  getById: async (id) => {
    const response = await api.get(`/admin/supplier-users/${id}`);
    return response.data;
  },

  // Approve supplier user
  approve: async (id) => {
    const response = await api.put(`/admin/supplier-users/${id}/approve`);
    return response.data;
  },

  // Reject supplier user
  reject: async (id, reason) => {
    const response = await api.put(`/admin/supplier-users/${id}/reject`, { reason });
    return response.data;
  },

  // Toggle supplier user status (activate/deactivate)
  toggleStatus: async (id) => {
    const response = await api.put(`/admin/supplier-users/${id}/toggle-status`);
    return response.data;
  },

  // Delete supplier user
  delete: async (id) => {
    const response = await api.delete(`/admin/supplier-users/${id}`);
    return response.data;
  },

  // Get supplier user statistics
  getStats: async () => {
    const response = await api.get('/admin/supplier-users/stats/overview');
    return response.data;
  }
};

export default adminSupplierUserService;
