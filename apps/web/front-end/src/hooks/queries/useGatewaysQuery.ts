import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gatewayService } from '@/services/gatewayService';
import { gatewayKeys } from '@/services/queryKeys';
import type { GatewayBackend, CreateGatewayPayload, UpdateGatewayPayload } from '@/types/gateway.types';
import type { ApiError } from '@/services/api';

export function useGatewaysQuery(kebunId?: string) {
  return useQuery<GatewayBackend[], ApiError>({
    queryKey: gatewayKeys.list(kebunId || ''),
    queryFn: () => (kebunId && kebunId.trim() ? gatewayService.getAllByKebun(kebunId.trim()) : Promise.resolve([])),
    enabled: Boolean(kebunId && kebunId.trim() && kebunId !== 'Semua Kebun' && kebunId !== 'undefined' && kebunId !== 'null'),
  });
}

export function useGatewayDetailQuery(id?: string) {
  return useQuery<GatewayBackend | null, ApiError>({
    queryKey: gatewayKeys.detail(id || ''),
    queryFn: () => (id ? gatewayService.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id && id.trim()),
  });
}

export function useCreateGatewayMutation(kebunId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGatewayPayload) => gatewayService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gatewayKeys.all });
      if (kebunId) {
        queryClient.invalidateQueries({ queryKey: gatewayKeys.list(kebunId) });
      }
    },
  });
}

export function useUpdateGatewayMutation(kebunId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGatewayPayload }) =>
      gatewayService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gatewayKeys.all });
      queryClient.invalidateQueries({ queryKey: gatewayKeys.detail(variables.id) });
      if (kebunId) {
        queryClient.invalidateQueries({ queryKey: gatewayKeys.list(kebunId) });
      }
    },
  });
}

export function useDeleteGatewayMutation(kebunId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gatewayService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gatewayKeys.all });
      if (kebunId) {
        queryClient.invalidateQueries({ queryKey: gatewayKeys.list(kebunId) });
      }
    },
  });
}
