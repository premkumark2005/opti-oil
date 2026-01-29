import api from './api';

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  
  getUnreadCount: () => api.get('/notifications/unread/count'),
  
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  
  deleteReadNotifications: () => api.delete('/notifications/read'),
  
  getNotificationStats: () => api.get('/notifications/stats')
};
