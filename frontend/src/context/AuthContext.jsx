import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
      const response = await api.post(endpoint, { email, password });
      
      const { token, user: userData } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user
      setUser(userData);
      
      toast.success('Login successful!');
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/wholesaler/dashboard');
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/auth/register', formData);
      
      toast.success('Registration successful! Please wait for admin approval.');
      navigate('/login');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    // Clear token
    localStorage.removeItem('token');
    
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user
    setUser(null);
    
    // Redirect to login
    navigate('/login');
    
    toast.info('Logged out successfully');
  };

  const updateProfile = async (formData) => {
    try {
      const response = await api.put('/auth/profile', formData);
      
      setUser(response.data.data.user);
      toast.success('Profile updated successfully!');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isWholesaler: user?.role === 'wholesaler'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
