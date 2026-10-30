import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sensorService } from '@/services/sensorService';
import { sensorKeys, blockKeys, farmKeys } from '@/services/queryKeys';
import type { SensorNodeItem, SensorSummaryMetrics } from '@/types/sensor.types';
import type { CreateNodePayload, UpdateNodePayload } from '@/types/node.types';
import type { ApiError } from '@/services/api';

export function useSensorsQuery(kebunId?: string) {
  return useQuery<SensorNodeItem[], ApiError>({
    queryKey: sensorKeys.list(kebunId),
    queryFn: () => sensorService.getAll(kebunId),
    enabled: Boolean(kebunId && kebunId !== 'Semua Kebun'),
  });
}

export function useSensorsSummaryQuery(sensorsList?: SensorNodeItem[], kebunId?: string) {
  return useQuery<SensorSummaryMetrics, ApiError>({
    queryKey: sensorKeys.summary(kebunId),
    queryFn: () => sensorService.getSummary(sensorsList),
  });
}

export function useCreateSensorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNodePayload) => sensorService.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sensorKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['nodes'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateSensorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNodePayload }) =>
      sensorService.update(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sensorKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: sensorKeys.detail(variables.id), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['nodes'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useDeleteSensorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sensorService.delete(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sensorKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['nodes'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useRegenerateNodeQrMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sensorId: string) => sensorService.generateNewQr(sensorId),
    onSuccess: async (_, sensorId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sensorKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['nodes'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: sensorKeys.detail(sensorId), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
      ]);
    },
  });
}

