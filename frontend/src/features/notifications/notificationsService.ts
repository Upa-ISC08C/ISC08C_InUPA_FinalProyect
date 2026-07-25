// frontend/src/features/notifications/notificationsService.ts
import api from '../../services/api';

export const notificationsService = {
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  async markAsRead(id: string) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};