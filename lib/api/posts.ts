import apiClient from './client';
import { Post, CreatePostRequest, UpdatePostRequest, PostFilters } from '@/lib/types';

const MAX_TAKE = 100;

const normalizePostFilters = (params?: PostFilters): PostFilters | undefined => {
  if (!params) return params;

  const normalized: PostFilters = { ...params };

  if (typeof normalized.take === 'number') {
    normalized.take = Math.min(Math.max(normalized.take, 1), MAX_TAKE);
  }

  if (typeof normalized.skip === 'number') {
    normalized.skip = Math.max(normalized.skip, 0);
  }

  return normalized;
};

export const postsAPI = {
  list: async (params?: PostFilters) => {
    try {
      const response = await apiClient.get<Post[]>('/posts', { params: normalizePostFilters(params) });
      return response.data;
    } catch (error: any) {
      console.error('Posts API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        params,
      });
      throw error;
    }
  },

  get: async (id: string) => {
    try {
      const response = await apiClient.get<Post>(`/posts/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get Post API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        postId: id,
      });
      throw error;
    }
  },

  create: async (data: CreatePostRequest) => {
    const response = await apiClient.post<Post>('/posts', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePostRequest) => {
    const response = await apiClient.patch<Post>(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/posts/${id}`);
  },

  setCover: async (id: string, fileId: string) => {
    const response = await apiClient.put<Post>(`/posts/${id}/cover`, { fileId });
    return response.data;
  },

  removeCover: async (id: string) => {
    const response = await apiClient.delete<Post>(`/posts/${id}/cover`);
    return response.data;
  },
};
