import api from './api';

const rawMaterialService = {
  // Create a new raw material
  create: async (rawMaterialData) => {
    const response = await api.post('/raw-materials', rawMaterialData);
    return response.data;
  },

  // Get all raw materials
  getAll: async (params = {}) => {
    const response = await api.get('/raw-materials', { params });
    return response.data;
  },

  // Get raw material by ID
  getById: async (id) => {
    const response = await api.get(`/raw-materials/${id}`);
    return response.data;
  },

  // Update raw material
  update: async (id, rawMaterialData) => {
    const response = await api.put(`/raw-materials/${id}`, rawMaterialData);
    return response.data;
  },

  // Delete raw material
  delete: async (id) => {
    const response = await api.delete(`/raw-materials/${id}`);
    return response.data;
  },

  // Get raw material statistics
  getStats: async () => {
    const response = await api.get('/raw-materials/stats/overview');
    return response.data;
  }
};

export default rawMaterialService;
