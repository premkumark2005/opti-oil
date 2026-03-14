import api from './api';

const rawMaterialInventoryService = {
  // Get all raw material inventory
  getAll: async (params = {}) => {
    const response = await api.get('/raw-material-inventory', { params });
    return response.data;
  },

  // Get raw material inventory by ID
  getById: async (id) => {
    const response = await api.get(`/raw-material-inventory/${id}`);
    return response.data;
  },

  // Stock in raw material
  stockIn: async (id, data) => {
    const response = await api.post(`/raw-material-inventory/${id}/stock-in`, data);
    return response.data;
  },

  // Stock out raw material
  stockOut: async (id, data) => {
    const response = await api.post(`/raw-material-inventory/${id}/stock-out`, data);
    return response.data;
  },

  // Adjust inventory
  adjust: async (id, data) => {
    const response = await api.post(`/raw-material-inventory/${id}/adjust`, data);
    return response.data;
  },

  // Update reorder level
  updateReorderLevel: async (id, reorderLevel) => {
    const response = await api.put(`/raw-material-inventory/${id}/reorder-level`, { reorderLevel });
    return response.data;
  },

  // Get low stock raw materials
  getLowStock: async () => {
    const response = await api.get('/raw-material-inventory/low-stock');
    return response.data;
  },

  // Get inventory statistics
  getStats: async () => {
    const response = await api.get('/raw-material-inventory/stats/overview');
    return response.data;
  },

  // Get inventory transactions
  getTransactions: async (id, params = {}) => {
    const response = await api.get(`/raw-material-inventory/${id}/transactions`, { params });
    return response.data;
  }
};

export default rawMaterialInventoryService;
