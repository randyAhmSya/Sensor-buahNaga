import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  scheduleService,
  type JadwalLampuBackend,
  type CreateJadwalLampuPayload,
  type UpdateJadwalLampuPayload,
} from '@/services/scheduleService';
import { scheduleKeys } from '@/services/queryKeys';
import type { ApiError } from '@/services/api';

export function useSchedulesQuery(params: { kebun_id?: string; sensor_id?: string }) {
  const hasFilter = Boolean(params.kebun_id || params.sensor_id);

  return useQuery<JadwalLampuBackend[], ApiError>({
    queryKey: scheduleKeys.list(params),
    queryFn: () => scheduleService.getAll(params),
    enabled: hasFilter,
  });
}

export function useActiveScheduleQuery(sensorId?: string) {
  return useQuery<JadwalLampuBackend | null, ApiError>({
    queryKey: scheduleKeys.active(sensorId || ''),
    queryFn: () => (sensorId ? scheduleService.getActive(sensorId) : Promise.resolve(null)),
    enabled: Boolean(sensorId && sensorId.trim() && sensorId !== 'Belum Terpasang'),
    retry: false,
  });
}

export function useCreateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJadwalLampuPayload) => scheduleService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useUpdateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateJadwalLampuPayload }) =>
      scheduleService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useDeleteScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}
