import apiClient from './client';
import { User, PublicProfile, UpdateProfileRequest, MembershipLevel, Role } from '@/lib/types';

export const usersAPI = {
  getProfile: async (id?: string) => {
    const url = id ? `/users/profile/${id}` : '/users/profile';
    const response = await apiClient.get<User>(url);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await apiClient.patch<User>('/users/profile', data);
    return response.data;
  },

  getPublicProfile: async (id: string) => {
    const response = await apiClient.get<PublicProfile>(`/users/public/${id}`);
    return response.data;
  },

  listPublicProfiles: async () => {
    const response = await apiClient.get<PublicProfile[]>('/users/public');
    return response.data;
  },

  // Admin only
  listUsers: async (params?: { isActive?: boolean }) => {
    const response = await apiClient.get<User[]>('/users', { params });
    return response.data;
  },

  listPending: async () => {
    const response = await apiClient.get<User[]>('/users/pending');
    return response.data;
  },

  approve: async (id: string) => {
    const response = await apiClient.post<User>(`/users/${id}/approve`);
    return response.data;
  },

  deactivate: async (id: string) => {
    const response = await apiClient.post<User>(`/users/${id}/deactivate`);
    return response.data;
  },

  deleteUser: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },

  // Admin: Update user's membership level
  updateMembershipLevel: async (id: string, membershipLevel: MembershipLevel) => {
    const response = await apiClient.patch<User>(`/users/${id}/membership-level`, { membershipLevel });
    return response.data;
  },

  // Admin: Update user's role
  updateRole: async (id: string, role: Role) => {
    const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },

  // Admin: Toggle user accountant access
  updateAccountantAccess: async (id: string, isAccountant: boolean) => {
    const response = await apiClient.patch<User>(`/users/${id}/accountant`, { isAccountant });
    return response.data;
  },

  // Admin: Allow user to set a new password
  allowPasswordReset: async (id: string) => {
    const response = await apiClient.post<User>(`/users/${id}/allow-password-reset`);
    return response.data;
  },
};
