import api from './api';

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  
  getProduct: (id) => api.get(`/products/${id}`),
  
  createProduct: (data) => {
    const config = data instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.post('/products', data, config);
  },
  
  updateProduct: (id, data) => {
    const config = data instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.put(`/products/${id}`, data, config);
  },
  
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
  
  getCategories: () => api.get('/products/categories/list'),
  
  getBrands: () => api.get('/products/brands/list'),
  
  getProductStats: () => api.get('/products/stats/overview')
};
