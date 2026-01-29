import api from './api';

export const wholesalerService = {
  getPendingWholesalers: () => api.get('/auth/wholesalers/pending'),
  
  approveWholesaler: (id, status) => 
    api.put(`/auth/wholesaler/${id}/approve`, { status })
};
