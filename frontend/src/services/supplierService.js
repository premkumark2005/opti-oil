import api from './api';

export const supplierService = {
  getAllSuppliers: (params) => api.get('/suppliers', { params }),
  
  getSupplier: (id) => api.get(`/suppliers/${id}`),
  
  addSupplier: (data) => api.post('/suppliers', data),
  
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),
  
  linkProducts: (id, productIds) => 
    api.post(`/suppliers/${id}/products`, { productIds }),
  
  removeProducts: (id, productIds) => 
    api.delete(`/suppliers/${id}/products`, { data: { productIds } }),
  
  getSuppliersByProduct: (productId) => 
    api.get(`/suppliers/product/${productId}`),
  
  getSupplierStats: () => api.get('/suppliers/stats')
};
