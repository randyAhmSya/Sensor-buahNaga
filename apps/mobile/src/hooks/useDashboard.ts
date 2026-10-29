import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  fetchDashboardData,
  type DashboardData,
} from '@/service/dashboardService';
import { QUERY_KEYS } from '@/constant/queryKeys';
import { authStorage, type AuthUser } from '@/service/authStorage';

// Discriminated union: cuma bisa 1 dari 3 kondisi ini yang aktif di satu waktu.
export type DashboardState =
  | { status: 'loading' }
  | { status: 'success'; data: DashboardData }
  | { status: 'error'; message: string };

function isPaymentRequiredError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 402;
  }
  return false;
}

export function useDashboard() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DashboardData, Error>({
    queryKey: QUERY_KEYS.dashboard.all,
    queryFn: fetchDashboardData,
    retry: (failureCount, err) => {
      if (isPaymentRequiredError(err)) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000,
  });

  const state: DashboardState = useMemo(() => {
    if (isLoading) {
      return { status: 'loading' };
    }
    if (isError) {
      return {
        status: 'error',
        message: error?.message || 'Gagal memuat data dashboard.',
      };
    }
    if (data) {
      return { status: 'success', data };
    }
    return { status: 'loading' };
  }, [isLoading, isError, error, data]);

  // Ambil profil user aktif dari in-memory authStorage
  const user: AuthUser | null = authStorage.getUser();

  const userName = user?.nama_lengkap || 'Petani Buah Naga';
  const greetingName = user?.nama_lengkap ? user.nama_lengkap.split(' ')[0] : 'Petani';

  const today = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  return {
    state,
    refetch,
    userName,
    greetingName,
    today,
  };
}