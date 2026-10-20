import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmService, type CreateFarmPayload } from '@/services/farmService';
import { farmKeys } from '@/services/queryKeys';
import type { FarmItem } from '@/types/farm.types';
import type { ApiError } from '@/services/api';

export function useFarmsQuery(tenantId?: string) {
  return useQuery<FarmItem[], ApiError>({
    queryKey: farmKeys.lists(),
    queryFn: () => farmService.getAll(tenantId),
  });
}

export function useFarmDetailQuery(id?: string) {
  return useQuery<FarmItem | undefined, ApiError>({
    queryKey: farmKeys.detail(id || ''),
    queryFn: () => (id ? farmService.getById(id) : Promise.resolve(undefined)),
    enabled: Boolean(id && id.trim()),
  });
}

export function useCreateFarmMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFarmPayload) => farmService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmKeys.all });
    },
  });
}

export function useUpdateFarmMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateFarmPayload> }) =>
      farmService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: farmKeys.all });
      queryClient.invalidateQueries({ queryKey: farmKeys.detail(variables.id) });
    },
  });
}

export function useDeleteFarmMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => farmService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmKeys.all });
    },
  });
}
