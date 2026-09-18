import { api } from './axios';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ data: { admin: { id: string; email: string } } }>('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  me: () =>
    api.get<{ data: { admin: { id: string; email: string; createdAt: string } } }>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),
};

