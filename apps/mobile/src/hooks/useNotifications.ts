import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  notificationService,
  type GetNotifikasiParams,
  type GetNotifikasiResult,
} from '@/service/notificationService';
import { QUERY_KEYS } from '@/constant/queryKeys';
import type { NotifikasiItem } from '@/types/notification';

function isPaymentRequiredError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 402;
  }
  return false;
}

/**
 * Hook TanStack Query untuk membaca feed notifikasi dari backend.
 */
export function useNotifications(params?: GetNotifikasiParams) {
  return useQuery<GetNotifikasiResult, Error>({
    queryKey: QUERY_KEYS.notifications.list(params as Record<string, unknown>),
    queryFn: () => notificationService.getNotifikasi(params),
    retry: (failureCount, error) => {
      if (isPaymentRequiredError(error)) return false;
      return failureCount < 2;
    },
    staleTime: 15000,
  });
}

/**
 * Hook ringan untuk polling/membaca unread badge count di navbar / header.
 */
export function useUnreadNotificationCount() {
  return useQuery<number, Error>({
    queryKey: QUERY_KEYS.notifications.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    retry: (failureCount, error) => {
      if (isPaymentRequiredError(error)) return false;
      return failureCount < 1;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

/**
 * Mutasi tandai 1 notifikasi sudah dibaca.
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<NotifikasiItem, Error, string>({
    mutationFn: (id: string) => notificationService.tandaiDibaca(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}

/**
 * Mutasi tandai seluruh notifikasi sudah dibaca.
 */
export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation<number, Error, void>({
    mutationFn: () => notificationService.tandaiSemuaDibaca(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
  });
}