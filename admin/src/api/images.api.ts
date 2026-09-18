import { api } from './axios';

export interface Image {
  id: string;
  url: string;
  publicId: string;
  showInSlider: boolean;
  order: number;
  albumId: string;
  createdAt: string;
}

export const imagesApi = {
  upload: (albumId: string, formData: FormData) =>
    api.post(`/albums/${albumId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  patch: (albumId: string, imageId: string, data: { showInSlider?: boolean; order?: number }) =>
    api.patch<{ data: Image }>(`/albums/${albumId}/images/${imageId}`, data),

  reorder: (albumId: string, items: { id: string; order: number }[]) =>
    api.patch(`/albums/${albumId}/images/reorder`, { items }),

  delete: (albumId: string, imageId: string) =>
    api.delete(`/albums/${albumId}/images/${imageId}`),
};
