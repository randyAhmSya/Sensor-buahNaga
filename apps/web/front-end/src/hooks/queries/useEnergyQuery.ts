import { useQuery } from '@tanstack/react-query';
import { energyService, type EnergySummary, type EnergyLogResponse } from '@/services/energyService';
import { energyKeys } from '@/services/queryKeys';
import type { ApiError } from '@/services/api';

export function useEnergySummaryQuery(sensorId?: string) {
  return useQuery<EnergySummary, ApiError>({
    queryKey: energyKeys.summary(sensorId || ''),
    queryFn: () => (sensorId ? energyService.getBlockSummary(sensorId) : Promise.resolve({
      kwh: 0,
      period: 'Bulan Ini',
      description: 'Belum ada akumulasi konsumsi listrik tercatat periode ini.',
      weeklyUsage: [0, 0, 0, 0, 0, 0, 0],
    })),
    enabled: Boolean(sensorId && sensorId.trim() && sensorId !== 'Belum Terpasang'),
  });
}

export function useEnergyLogsQuery(sensorId?: string, limit: number = 100) {
  return useQuery<EnergyLogResponse, ApiError>({
    queryKey: energyKeys.logs(sensorId || ''),
    queryFn: () => (sensorId ? energyService.fetchLogEnergy(sensorId, limit) : Promise.resolve({ total_kwh: 0, riwayat: [] })),
    enabled: Boolean(sensorId && sensorId.trim() && sensorId !== 'Belum Terpasang'),
  });
}
