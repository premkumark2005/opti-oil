import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 second timeout (reduced from 30s)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token and handle request errors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and standardize responses
api.interceptors.response.use(
  (response) => {
    // Success response - return data directly
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Network error - could be CORS, timeout, or connection refused
      console.error('Network error:', error.message);
      
      // Only show toast for actual network failures, not during initial load
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        // Check if this is during app initialization
        const isInitialLoad = !localStorage.getItem('token');
        if (!isInitialLoad) {
          toast.error('Cannot connect to server. Please ensure the backend is running.');
        }
      }
      
      return Promise.reject({
        message: error.message || 'Network error',
        code: error.code,
        status: 0
      });
    }

    const { status, data } = error.response;

    // Handle specific error codes
    switch (status) {
      case 400:
        // Bad Request - validation errors
        if (data.errors) {
          const errorMessages = data.errors.map(err => err.message).join(', ');
          toast.error(errorMessages);
        } else {
          toast.error(data.message || 'Invalid request');
        }
        break;

      case 401:
        // Unauthorized - token invalid or expired
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        break;

      case 403:
        // Forbidden - insufficient permissions
        toast.error('You do not have permission to perform this action');
        break;

      case 404:
        // Not Found
        toast.error(data.message || 'Resource not found');
        break;

      case 409:
        // Conflict - duplicate data
        toast.error(data.message || 'Resource already exists');
        break;

      case 422:
        // Validation Error
        if (data.errors) {
          const errorMessages = data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
          toast.error(errorMessages);
        } else {
          toast.error(data.message || 'Validation failed');
        }
        break;

      case 429:
        // Too Many Requests - rate limit
        toast.error(data.message || 'Too many requests. Please try again later.');
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        toast.error('Server error. Please try again later.');
        break;

      default:
        toast.error(data.message || 'An unexpected error occurred');
    }

    return Promise.reject(error.response);
  }
);

// Helper function to handle API errors consistently
export const handleApiError = (error) => {
  if (error.response?.data) {
    return error.response.data;
  }
  return {
    success: false,
    message: error.message || 'An unexpected error occurred'
  };
};

// Retry logic for failed requests
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export default api;
