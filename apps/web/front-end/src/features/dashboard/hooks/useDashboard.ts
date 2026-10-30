import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { dashboardKeys } from '@/services/queryKeys';
import type { PetaniDashboardData } from '@/types/dashboard.types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface UseDashboardResult {
  dashboard: PetaniDashboardData | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

export function useDashboard(kebunId?: string) {
  const cleanId = (kebunId || '').trim();
  const isValidId = Boolean(cleanId && UUID_REGEX.test(cleanId));

  return useQuery<PetaniDashboardData | null, Error>({
    queryKey: dashboardKeys.detail(cleanId),
    queryFn: async () => {
      if (!isValidId) return null;
      return await dashboardService.getPetaniDashboard(cleanId);
    },
    enabled: isValidId,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

