import api from './api';

const supplierAuthService = {
  // Register a new supplier
  register: async (supplierData) => {
    const response = await api.post('/supplier-auth/register', supplierData);
    return response.data;
  },

  // Login supplier
  login: async (credentials) => {
    const response = await api.post('/supplier-auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.supplier));
    }
    return response.data;
  },

  // Logout supplier
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get supplier profile
  getProfile: async () => {
    const response = await api.get('/supplier-auth/me');
    return response.data;
  },

  // Update supplier profile
  updateProfile: async (profileData) => {
    const response = await api.put('/supplier-auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/supplier-auth/change-password', passwordData);
    return response.data;
  },

  // Get current supplier from localStorage
  getCurrentSupplier: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  }
};

export default supplierAuthService;
