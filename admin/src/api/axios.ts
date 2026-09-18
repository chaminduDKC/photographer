import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Dedicated instance without interceptors for refreshing tokens to prevent recursion
const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(undefined);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT intercept if there is no request config or if it's the login/refresh endpoint itself
    if (
      !originalRequest ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Intercept any 401 Unauthorized response that hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another request is already refreshing the token, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the access token using the httpOnly refreshToken cookie
        await refreshClient.post('/auth/refresh');
        
        // Notify all queued requests that refresh was successful
        processQueue(null);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is also expired or invalid: reject queued requests and force login
        processQueue(refreshError);
        useAuthStore.getState().clearAuth();
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
