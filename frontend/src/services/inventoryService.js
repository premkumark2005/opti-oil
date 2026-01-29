import api from './api';

export const inventoryService = {
  getAllInventory: (params) => api.get('/inventory', { params }),
  
  getProductInventory: (productId) => api.get(`/inventory/product/${productId}`),
  
  stockIn: (data) => api.post('/inventory/stock-in', data),
  
  stockOut: (data) => api.post('/inventory/stock-out', data),
  
  adjustInventory: (data) => api.post('/inventory/adjust', data),
  
  getLowStockProducts: () => api.get('/inventory/low-stock'),
  
  updateReorderLevel: (id, reorderLevel) => 
    api.put(`/inventory/${id}/reorder-level`, { reorderLevel }),
  
  getInventoryTransactions: (params) => 
    api.get('/inventory/transactions', { params })
};
