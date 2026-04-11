import apiClient from './client';
import { File, FileKind, Visibility } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

export const filesAPI = {
  upload: async (
    file: globalThis.File,
    visibility: Visibility = Visibility.PUBLIC,
    kind: FileKind = FileKind.OTHER
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', visibility);
    formData.append('kind', kind);

    const response = await apiClient.post<File>('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  download: async (id: string) => {
    const response = await apiClient.get<Blob>(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/files/${id}`);
  },

  getUrl: (storageKey: string) => {
    return `${API_BASE.replace('/api', '')}/uploads/${storageKey}`;
  },
};
