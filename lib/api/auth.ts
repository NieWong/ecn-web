import apiClient from './client';
import { AuthResponse, LoginRequest, RegisterRequest, SetPasswordRequest, User } from '@/lib/types';

export const authAPI = {
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<{ user: User; message: string }>('/auth/register', data);
    return response.data;
  },

  setPassword: async (data: SetPasswordRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/set-password', data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<User | null>('/auth/me');
    return response.data;
  },
};
