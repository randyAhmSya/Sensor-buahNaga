import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { farmService, type CreateFarmPayload } from '@/services/farmService';
import { blockService } from '@/services/blockService';
import { farmKeys, petaniSubscriptionKeys } from '@/services/queryKeys';
import type { FarmItem } from '@/types/farm.types';
import type { ApiError } from '@/services/api';
import { isNonRetryableError } from '@/lib/queryClient';
import type { StatusLanggananPetani } from '@/types/petaniSubscription.types';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES } from '@/config/constants';

export interface UseFarmsQueryOptions {
  enabled?: boolean;
}

export function useFarmsQuery(tenantId?: string, options?: UseFarmsQueryOptions) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  const isLanggananPage = location.pathname.includes('/kebun/langganan');
  const subscriptionStatus = queryClient.getQueryData<StatusLanggananPetani>(
    petaniSubscriptionKeys.status()
  );

  const isExpired =
    subscriptionStatus?.status_langganan === 'kadaluarsa' ||
    (subscriptionStatus?.sisa_hari !== undefined && subscriptionStatus.sisa_hari <= 0);

  // Default enabled:
  // 1. Aktif untuk Super Admin atau request dengan tenantId spesifik
  // 2. Nonaktif jika berada di /kebun/langganan atau jika status langganan kadaluarsa
  const defaultEnabled = Boolean(
    isSuperAdmin || (tenantId && tenantId.trim()) || (!isLanggananPage && !isExpired)
  );

  const isEnabled = (options?.enabled ?? true) && defaultEnabled;

  return useQuery<FarmItem[], ApiError>({
    queryKey: tenantId && tenantId.trim() ? ['kebun', tenantId.trim()] : (['kebun'] as const),
    queryFn: () => farmService.getAll(tenantId),
    enabled: isEnabled,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (isNonRetryableError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook query kebun beserta blok riil untuk modul operasional
 * Membaca cache ['kebun'] terlebih dahulu bila ada agar tidak menembak endpoint kebun 2x
 */
export function useFarmsWithBlocksQuery(options?: UseFarmsQueryOptions) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  const isLanggananPage = location.pathname.includes('/kebun/langganan');
  const subscriptionStatus = queryClient.getQueryData<StatusLanggananPetani>(
    petaniSubscriptionKeys.status()
  );

  const isExpired =
    subscriptionStatus?.status_langganan === 'kadaluarsa' ||
    (subscriptionStatus?.sisa_hari !== undefined && subscriptionStatus.sisa_hari <= 0);

  const defaultEnabled = Boolean(
    isSuperAdmin || (!isLanggananPage && !isExpired)
  );

  const isEnabled = (options?.enabled ?? true) && defaultEnabled;

  return useQuery<FarmItem[], ApiError>({
    queryKey: farmKeys.withBlocks(),
    queryFn: async (): Promise<FarmItem[]> => {
      // Optimasi deduplikasi: gunakan data dasar kebun dari cache ['kebun'] jika sudah ada
      const cachedFarms = queryClient.getQueryData<FarmItem[]>(['kebun']);
      let baseFarms = cachedFarms;
      if (!baseFarms || baseFarms.length === 0) {
        baseFarms = await farmService.getAll();
      }

      if (!baseFarms || baseFarms.length === 0) {
        return [];
      }

      const farmsWithBlocks = await Promise.all(
        baseFarms.map(async (farm) => {
          const blocks = await blockService.getBlocksByFarmId(farm.id).catch(() => []);
          return {
            ...farm,
            totalBlocks: blocks.length,
            blocks,
          };
        })
      );

      return farmsWithBlocks;
    },
    enabled: isEnabled,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (isNonRetryableError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useFarmDetailQuery(id?: string, options?: UseFarmsQueryOptions) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  const isLanggananPage = location.pathname.includes('/kebun/langganan');
  const subscriptionStatus = queryClient.getQueryData<StatusLanggananPetani>(
    petaniSubscriptionKeys.status()
  );

  const isExpired =
    subscriptionStatus?.status_langganan === 'kadaluarsa' ||
    (subscriptionStatus?.sisa_hari !== undefined && subscriptionStatus.sisa_hari <= 0);

  const defaultEnabled = Boolean(
    id && id.trim() && (isSuperAdmin || (!isLanggananPage && !isExpired))
  );

  const isEnabled = (options?.enabled ?? true) && defaultEnabled;

  return useQuery<FarmItem | undefined, ApiError>({
    queryKey: farmKeys.detail(id || ''),
    queryFn: () => (id ? farmService.getById(id) : Promise.resolve(undefined)),
    enabled: isEnabled,
    retry: (failureCount, error) => {
      if (isNonRetryableError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCreateFarmMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFarmPayload) => farmService.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateFarmMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateFarmPayload> }) =>
      farmService.update(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.detail(variables.id), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
      ]);
    },
  });
}

export function useDeleteFarmMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => farmService.delete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
      ]);
    },
  });
}

