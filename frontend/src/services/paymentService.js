import api from './api';

export const paymentService = {
  // Call to verify payment signature for Wholesaler
  verifyPayment: async (paymentData) => {
    return api.post('/payments/verify', paymentData);
  },

  // Re-initiate order payment if it was closed or failed
  createOrderPayment: async (orderId) => {
    return api.post(`/payments/order/${orderId}`);
  },

  // Admin initiates payout to supplier
  createSupplierPayout: async (orderId) => {
    return api.post('/payments/supplier', { orderId });
  }
};
