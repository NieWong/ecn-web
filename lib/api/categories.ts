import apiClient from './client';
import { Category } from '@/lib/types';

export const categoriesAPI = {
  list: async () => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: { name: string; slug: string }) => {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; slug?: string }) => {
    const response = await apiClient.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/categories/${id}`);
  },
};
