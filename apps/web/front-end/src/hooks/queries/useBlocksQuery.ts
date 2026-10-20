import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blockService, type CreateBlockPayload } from '@/services/blockService';
import { blockKeys } from '@/services/queryKeys';
import type { BlokBackend, BlockDetailFull } from '@/types/block.types';
import type { ApiError } from '@/services/api';

export function useBlocksQuery(kebunId: string) {
  return useQuery<BlokBackend[], ApiError>({
    queryKey: blockKeys.list(kebunId),
    queryFn: () => blockService.getAll(kebunId),
    enabled: Boolean(kebunId && kebunId !== 'Semua Kebun' && kebunId !== 'undefined'),
  });
}

export function useBlockDetailQuery(farmId: string, blockId?: string) {
  return useQuery<BlockDetailFull | null, ApiError>({
    queryKey: blockKeys.detail(blockId || ''),
    queryFn: () => (blockId ? blockService.getById(farmId, blockId) : Promise.resolve(null)),
    enabled: Boolean(blockId && blockId.trim()),
  });
}

export function useCreateBlockMutation(kebunId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBlockPayload) => blockService.create(kebunId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
      queryClient.invalidateQueries({ queryKey: blockKeys.list(kebunId) });
    },
  });
}

export function useUpdateBlockMutation(kebunId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateBlockPayload> }) =>
      blockService.update(kebunId, id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: blockKeys.list(kebunId) });
    },
  });
}

export function useDeleteBlockMutation(kebunId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blockService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all });
      if (kebunId) {
        queryClient.invalidateQueries({ queryKey: blockKeys.list(kebunId) });
      }
    },
  });
}
