import api from './api';

const rawMaterialOrderService = {
  // Create a new raw material order (Admin)
  create: async (orderData) => {
    const response = await api.post('/raw-material-orders', orderData);
    return response.data;
  },

  // Get all raw material orders
  getAll: async (params = {}) => {
    const response = await api.get('/raw-material-orders', { params });
    return response.data;
  },

  // Get raw material order by ID
  getById: async (id) => {
    const response = await api.get(`/raw-material-orders/${id}`);
    return response.data;
  },

  // Update order status (Supplier)
  updateStatus: async (id, status) => {
    const response = await api.put(`/raw-material-orders/${id}/status`, { status });
    return response.data;
  },

  // Mark order as delivered (Supplier)
  markAsDelivered: async (id) => {
    const response = await api.put(`/raw-material-orders/${id}/deliver`);
    return response.data;
  },

  // Get supplier order statistics
  getSupplierStats: async () => {
    const response = await api.get('/raw-material-orders/stats/overview');
    return response.data;
  },

  // Get admin order statistics
  getAdminStats: async () => {
    const response = await api.get('/raw-material-orders/admin/stats');
    return response.data;
  }
};

export default rawMaterialOrderService;
