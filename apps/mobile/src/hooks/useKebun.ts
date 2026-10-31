import { useQuery } from "@tanstack/react-query";
import { fetchKebunList } from "@/service/kebunService";
import { QUERY_KEYS } from "@/constant/queryKeys";
import type { BackendKebunDTO } from "@/types/api/kebun.dto";

/**
 * Hook TanStack Query terstandarisasi untuk data kebun petani.
 * Data di-cache selama 5 menit dan tidak di-refetch pada mount jika cache masih fresh.
 */
export function useKebunList() {
  return useQuery<BackendKebunDTO[], Error>({
    queryKey: QUERY_KEYS.kebun.list(),
    queryFn: fetchKebunList,
    staleTime: 5 * 60 * 1000, // 5 menit
    refetchOnMount: false,
  });
}

