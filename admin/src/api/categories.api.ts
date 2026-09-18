import { api } from './axios';

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  createdAt: string;
}

export const categoriesApi = {
  list: () => api.get<{ data: Category[] }>('/categories'),

  create: (data: FormData) =>
    api.post<{ data: Category }>('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData) =>
    api.put<{ data: Category }>(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => api.delete(`/categories/${id}`),

  reorder: (items: { id: string; order: number }[]) =>
    api.patch('/categories/reorder', { items }),
};
