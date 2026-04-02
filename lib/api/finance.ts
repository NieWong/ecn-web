import apiClient from './client';
import {
  CreateFinanceEntryRequest,
  FinanceEntry,
  FinanceFilters,
  FinanceSummary,
  UpdateFinanceEntryRequest,
} from '@/lib/types';

export const financeAPI = {
  list: async (params?: FinanceFilters) => {
    const response = await apiClient.get<FinanceEntry[]>('/finance', { params });
    return response.data;
  },

  summary: async (params?: FinanceFilters) => {
    const response = await apiClient.get<FinanceSummary>('/finance/summary', { params });
    return response.data;
  },

  create: async (data: CreateFinanceEntryRequest) => {
    const response = await apiClient.post<FinanceEntry>('/finance', data);
    return response.data;
  },

  update: async (id: string, data: UpdateFinanceEntryRequest) => {
    const response = await apiClient.patch<FinanceEntry>(`/finance/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    await apiClient.delete(`/finance/${id}`);
  },
};
