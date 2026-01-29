import api from './api';

export const orderService = {
  placeOrder: (data) => api.post('/orders', data),
  
  getAllOrders: (params) => api.get('/orders', { params }),
  
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  
  getOrder: (id) => api.get(`/orders/${id}`),
  
  getPendingOrders: () => api.get('/orders/pending'),
  
  approveOrder: (id) => api.put(`/orders/${id}/approve`),
  
  rejectOrder: (id, reason) => api.put(`/orders/${id}/reject`, { reason }),
  
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  
  getOrderStats: () => api.get('/orders/stats')
};
