import { useQuery } from '@tanstack/react-query';
import { telemetryService, type ReadSensor } from '@/services/telemetryService';
import { telemetryKeys } from '@/services/queryKeys';
import type { ApiError } from '@/services/api';

export function useTelemetryLatestQuery(sensorId?: string) {
  return useQuery<ReadSensor | null, ApiError>({
    queryKey: telemetryKeys.latest(sensorId || ''),
    queryFn: () => (sensorId ? telemetryService.getLatest(sensorId) : Promise.resolve(null)),
    enabled: Boolean(sensorId && sensorId.trim() && sensorId !== 'Belum Terpasang'),
    staleTime: 1000 * 30, // 30 detik
    refetchInterval: 1000 * 60, // auto refetch setiap 60 detik
  });
}

export function useTelemetryHistoryQuery(sensorId?: string, limit: number = 100) {
  return useQuery<ReadSensor[], ApiError>({
    queryKey: telemetryKeys.history(sensorId || '', limit),
    queryFn: () => (sensorId ? telemetryService.fetchTelemetri(sensorId, limit) : Promise.resolve([])),
    enabled: Boolean(sensorId && sensorId.trim() && sensorId !== 'Belum Terpasang'),
    staleTime: 1000 * 30,
  });
}
