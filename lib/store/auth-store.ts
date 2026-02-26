import { create } from 'zustand';
import { User } from '@/lib/types';
import { authAPI } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name?: string) => Promise<{ message: string }>;
  setPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
      }
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, name?: string) => {
    try {
      const response = await authAPI.register({ email, name });
      return { message: response.message };
    } catch (error) {
      throw error;
    }
  },

  setPassword: async (email: string, password: string) => {
    try {
      const response = await authAPI.setPassword({ email, password });
      
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
      }
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  refreshUser: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const user = await authAPI.getMe();
      
      if (user) {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Token invalid, clear it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      // Token invalid or network error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },
}));
