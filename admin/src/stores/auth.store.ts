import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminInfo {
  id: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  admin: AdminInfo | null;
  setAuth: (admin: AdminInfo) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      admin: null,
      setAuth: (admin) => set({ isAuthenticated: true, admin }),
      clearAuth: () => set({ isAuthenticated: false, admin: null }),
    }),
    { name: 'photo-admin-auth' }
  )
);
