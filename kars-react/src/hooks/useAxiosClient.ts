import { useMemo } from 'react';
import { createAxiosClient, axiosAdmin } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export function useAxiosClient() {
  const { user } = useAuth();

  return useMemo(() => {
    if (user?.username && user?.password) {
      return createAxiosClient(user.username, user.password);
    }
    // Fallback al cliente admin por defecto
    return axiosAdmin;
  }, [user]);
}