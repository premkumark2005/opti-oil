import api from './api';

export const reportService = {
  getInventoryStatusReport: () => api.get('/reports/inventory-status'),
  
  getLowStockReport: () => api.get('/reports/low-stock'),
  
  getOrderSummaryReport: (params) => api.get('/reports/order-summary', { params }),
  
  getProductPerformanceReport: () => api.get('/reports/product-performance')
};
