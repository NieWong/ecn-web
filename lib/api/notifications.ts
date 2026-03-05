import apiClient from './client';
import { Notification } from '@/lib/types';

export const notificationsAPI = {
  list: async (params?: { unreadOnly?: boolean; take?: number; skip?: number }) => {
    const response = await apiClient.get<Notification[]>('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.post<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post<{ success: boolean }>('/notifications/mark-all-read');
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/notifications/${id}`);
  },

  deleteAll: async () => {
    await apiClient.delete('/notifications');
  },
};
