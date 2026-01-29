import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  adminLogin: (email, password) => api.post('/auth/admin/login', { email, password }),
  
  register: (data) => api.post('/auth/register', data),
  
  getMe: () => api.get('/auth/me'),
  
  updateProfile: (data) => api.put('/auth/profile', data),
  
  changePassword: (data) => api.put('/auth/change-password', data)
};
