import api from './api';

export const userService = {
  // Get all wholesalers (Admin only)
  getAllWholesalers: () => api.get('/users/wholesalers'),

  // Update wholesaler status (Admin only)
  updateWholesalerStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),

  // Get user profile
  getProfile: () => api.get('/auth/me'),

  // Update user profile
  updateProfile: (data) => api.put('/auth/profile', data),

  // Change password
  changePassword: (data) => api.put('/auth/change-password', data)
};
