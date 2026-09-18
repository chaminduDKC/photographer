import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';

export function useAuth() {
  const { isAuthenticated, admin, setAuth, clearAuth } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  useEffect(() => {
    if (data?.data?.data?.admin) {
      setAuth(data.data.data.admin);
    } else if (isError) {
      clearAuth();
    }
  }, [data, isError, setAuth, clearAuth]);

  return { isAuthenticated, admin, isLoading };
}
