import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { harvestService } from '@/service/harvestService';
import { QUERY_KEYS } from '@/constant/queryKeys';
import type {
  SiklusPanenItem,
  CreateSiklusPayload,
} from '@/types/harvest';

function isPaymentRequiredError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 402;
  }
  return false;
}

/**
 * Hook untuk mengambil daftar siklus panen pada satu blok lahan.
 */
export function useHarvestList(blokId?: string) {
  return useQuery<SiklusPanenItem[], Error>({
    queryKey: QUERY_KEYS.harvest.list(blokId),
    queryFn: () => {
      if (!blokId) return Promise.resolve([]);
      return harvestService.getSiklusByBlok(blokId);
    },
    enabled: !!blokId,
    retry: (failureCount, error) => {
      if (isPaymentRequiredError(error)) return false;
      return failureCount < 2;
    },
    staleTime: 30000,
  });
}

/**
 * Hook untuk mengambil detail satu siklus panen berdasarkan ID.
 */
export function useHarvestDetail(id?: string) {
  return useQuery<SiklusPanenItem | null, Error>({
    queryKey: QUERY_KEYS.harvest.detail(id),
    queryFn: () => {
      if (!id) return Promise.resolve(null);
      return harvestService.getSiklusById(id);
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if (isPaymentRequiredError(error)) return false;
      return failureCount < 2;
    },
    staleTime: 30000,
  });
}

/**
 * Mutasi untuk memulai siklus penyinaran baru.
 */
export function useCreateHarvestMutation() {
  const queryClient = useQueryClient();

  return useMutation<SiklusPanenItem, Error, CreateSiklusPayload>({
    mutationFn: (payload: CreateSiklusPayload) =>
      harvestService.createSiklus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.harvest.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
  });
}

/**
 * Mutasi untuk mencatat tanggal bunga mekar aktual.
 */
export function useRecordFlowerMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    SiklusPanenItem,
    Error,
    { id: string; tanggalBerbunga: string }
  >({
    mutationFn: ({ id, tanggalBerbunga }) =>
      harvestService.catatBungaMekar(id, tanggalBerbunga),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.harvest.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.harvest.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
  });
}

/**
 * Mutasi untuk menandai panen selesai.
 */
export function useFinishHarvestMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    SiklusPanenItem,
    Error,
    { id: string; tanggalPanen?: string }
  >({
    mutationFn: ({ id, tanggalPanen }) =>
      harvestService.tandaiPanenSelesai(id, tanggalPanen),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.harvest.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.harvest.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
  });
}