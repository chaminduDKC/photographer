import axios from 'axios';
import { cache } from 'react';

const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return (
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:4000/api'
    );
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
};

const api = axios.create({
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getBaseUrl();
  }
  return config;
});

// Types
export interface BusinessInfo {
  id: string;
  phone1: string;
  phone2: string | null;
  whatsapp: string | null;
  address: string;
  city: string;
  province: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  _count: { albums: number };
}

export interface Album {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string;
  isFeatured: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  createdAt: string;
}

export interface AlbumDetail extends Album {
  images: ImageItem[];
  _count: { images: number };
}

export interface ImageItem {
  id: string;
  url: string;
  publicId: string;
  showInSlider: boolean;
  order: number;
  albumId: string;
}

export interface SliderImage {
  id: string;
  url: string;
  albumId: string;
}

export interface PaginatedResponse<T> {
  albums: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorResponse {
  images: ImageItem[];
  nextCursor: string | undefined;
  hasMore: boolean;
}

// API Functions wrapped in React cache() for request deduplication across Server Components & metadata
export const getCategories = cache(async (): Promise<Category[]> => {
  const { data } = await api.get('/categories');
  return data.data;
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category> => {
  const { data } = await api.get(`/categories/${slug}`);
  return data.data;
});

export const getAlbums = cache(
  async (params: {
    categorySlug?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Album>> => {
    const { data } = await api.get('/albums', { params });
    return data.data;
  }
);

export const getAlbumBySlug = cache(async (slug: string): Promise<AlbumDetail> => {
  const { data } = await api.get(`/albums/slug/${slug}`);
  return data.data;
});

export async function getAlbumImages(
  albumId: string,
  cursor?: string,
  limit: number = 20
): Promise<CursorResponse> {
  const { data } = await api.get(`/albums/${albumId}/images`, {
    params: { cursor, limit },
  });
  return data.data;
}

export const getSliderImages = cache(async (): Promise<SliderImage[]> => {
  const { data } = await api.get('/images/slider');
  return data.data;
});

export const getBusinessInfo = cache(async (): Promise<BusinessInfo | null> => {
  try {
    const { data } = await api.get('/business');
    return data.data;
  } catch {
    return null;
  }
});

export default api;
