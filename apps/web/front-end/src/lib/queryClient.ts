import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/services/api';

/**
 * Memeriksa apakah suatu error merupakan error klien yang tidak boleh di-retry:
 * 401 (Unauthorized)
 * 402 (Payment Required)
 * 403 (Forbidden)
 * 404 (Not Found)
 */
export const isNonRetryableError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return [401, 402, 403, 404, 422].includes(error.status);
  }
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    const status = Number(errObj.status || errObj.statusCode || (errObj.response as Record<string, unknown> | undefined)?.status);
    if (!isNaN(status)) {
      return [401, 402, 403, 404, 422].includes(status);
    }
  }
  return false;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 detik
      gcTime: 1000 * 60 * 15, // 15 menit
      networkMode: 'offlineFirst',
      retry: (failureCount, error) => {
        if (isNonRetryableError(error)) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: (failureCount, error) => {
        if (isNonRetryableError(error)) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});
