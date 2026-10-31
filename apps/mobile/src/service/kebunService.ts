import apiClient from "./apiClient";
import type { BackendKebunDTO } from "@/types/api/kebun.dto";
import { queryClient } from "@/lib/queryClient";
import { QUERY_KEYS } from "@/constant/queryKeys";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Service pengambil daftar kebun petani langsung dari API backend:
 * GET /api/petani/kebun
 */
export async function fetchKebunList(): Promise<BackendKebunDTO[]> {
  const res = await apiClient.get<{ status: string; data: BackendKebunDTO[] }>(
    "/petani/kebun"
  );
  return res.data?.data || [];
}

/**
 * Helper terpusat untuk mengambil data kebun dari cache TanStack Query atau
 * melakukan in-flight request tunggal (deduplikasi paralel) via ensureQueryData.
 * Menjamin 0 request ganda saat multiple hooks memanggilnya secara bersamaan.
 */
export async function ensureKebunList(
  client?: QueryClient
): Promise<BackendKebunDTO[]> {
  const targetClient = client ?? queryClient;
  return targetClient.ensureQueryData<BackendKebunDTO[]>({
    queryKey: QUERY_KEYS.kebun.list(),
    queryFn: fetchKebunList,
    staleTime: 5 * 60 * 1000, // 5 menit
  });
}

