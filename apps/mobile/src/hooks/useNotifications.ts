import { AppState } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsFocused } from 'expo-router';
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
    staleTime: 30000,
    refetchOnMount: false,
  });
}

/**
 * Hook ringan untuk polling/membaca unread badge count di navbar / header.
 * Hanya melakukan polling saat layar aktif dan aplikasi di foreground.
 */
export function useUnreadNotificationCount() {
  const isFocused = useIsFocused();

  return useQuery<number, Error>({
    queryKey: QUERY_KEYS.notifications.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    retry: (failureCount, error) => {
      if (isPaymentRequiredError(error)) return false;
      return failureCount < 1;
    },
    staleTime: 30000,
    refetchOnMount: false,
    refetchInterval: () => {
      if (!isFocused || AppState.currentState !== 'active') {
        return false;
      }
      return 60000; // 60 detik
    },
    refetchIntervalInBackground: false,
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