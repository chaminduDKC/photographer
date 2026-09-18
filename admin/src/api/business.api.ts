import { api } from './axios';

export interface BusinessInfo {
  id: string;
  phone1: string;
  phone2?: string;
  whatsapp?: string;
  address: string;
  city: string;
  province: string;
  updatedAt: string;
}

export const businessApi = {
  get: () => api.get<{ data: BusinessInfo | null }>('/business'),
  update: (data: Omit<BusinessInfo, 'id' | 'updatedAt'>) =>
    api.put<{ data: BusinessInfo }>('/business', data),
};
