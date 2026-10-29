import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constant/queryKeys";
import { subscriptionService } from "@/service/subscriptionService";
import type {
  PaketLangganan,
  StatusLangganan,
  TransaksiLangganan,
  SnapOnlineResponse,
  PaginationMeta,
} from "@/types/subscription";

/**
 * Hook TanStack Query v5 untuk mengambil katalog paket aktif.
 */
export function useSubscriptionPackages() {
  return useQuery<PaketLangganan[], Error>({
    queryKey: QUERY_KEYS.subscription.packages(),
    queryFn: () => subscriptionService.getPaketAktif(),
    staleTime: 1000 * 60 * 10, // 10 menit
  });
}

/**
 * Hook TanStack Query v5 untuk memantau status langganan tenant saat ini.
 */
export function useSubscriptionStatus() {
  return useQuery<StatusLangganan, Error>({
    queryKey: QUERY_KEYS.subscription.status(),
    queryFn: () => subscriptionService.getStatus(),
    staleTime: 1000 * 60 * 2, // 2 menit
    retry: 1,
  });
}

/**
 * Hook TanStack Query v5 untuk mengambil riwayat transaksi langganan.
 */
export function useSubscriptionHistory(page = 1, perPage = 15) {
  return useQuery<{ items: TransaksiLangganan[]; meta?: PaginationMeta }, Error>({
    queryKey: QUERY_KEYS.subscription.history({ page, perPage }),
    queryFn: () => subscriptionService.getRiwayat(page, perPage),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Mutation untuk pembelian langganan manual via transfer bank + upload bukti.
 */
export function useBuyManualMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    TransaksiLangganan,
    Error,
    { paketId: string; fileUri: string; fileName?: string; mimeType?: string }
  >({
    mutationFn: ({ paketId, fileUri, fileName, mimeType }) =>
      subscriptionService.ajukanPembelianManual(
        paketId,
        fileUri,
        fileName,
        mimeType,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subscription.status(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subscription.history(),
      });
    },
  });
}

/**
 * Mutation untuk pembelian langganan online via Midtrans Snap.
 */
export function useBuyOnlineMutation() {
  const queryClient = useQueryClient();

  return useMutation<SnapOnlineResponse, Error, { paketId: string }>({
    mutationFn: ({ paketId }) =>
      subscriptionService.ajukanPembelianOnline(paketId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subscription.history(),
      });
    },
  });
}
