import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sensorService } from '@/services/sensorService';
import { sensorKeys } from '@/services/queryKeys';
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sensorKeys.all });
    },
  });
}

export function useUpdateSensorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNodePayload }) =>
      sensorService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sensorKeys.all });
      queryClient.invalidateQueries({ queryKey: sensorKeys.detail(variables.id) });
    },
  });
}

export function useDeleteSensorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sensorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sensorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
    },
  });
}

export function useRegenerateNodeQrMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sensorId: string) => sensorService.generateNewQr(sensorId),
    onSuccess: (_, sensorId) => {
      queryClient.invalidateQueries({ queryKey: sensorKeys.all });
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
      queryClient.invalidateQueries({ queryKey: sensorKeys.detail(sensorId) });
    },
  });
}

