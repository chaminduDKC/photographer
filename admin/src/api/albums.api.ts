import { api } from './axios';
import type { Category } from './categories.api';
import type { Image } from './images.api';

export interface Album {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  isFeatured: boolean;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  createdAt: string;
}

export interface AlbumWithImages extends Album {
  images: Image[];
}

export interface PaginatedAlbums {
  albums: Album[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const albumsApi = {
  list: (params?: { categoryId?: string; featured?: boolean; page?: number; limit?: number }) =>
    api.get<{ data: PaginatedAlbums }>('/albums', { params }),

  get: (id: string) => api.get<{ data: AlbumWithImages }>(`/albums/${id}`),

  create: (data: FormData) =>
    api.post<{ data: Album }>('/albums', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData) =>
    api.put<{ data: Album }>(`/albums/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => api.delete(`/albums/${id}`),
};
