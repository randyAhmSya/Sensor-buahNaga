import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constant/queryKeys";
import {
  getJadwalLampuAktif,
  updateJadwalManual,
  createJadwalOverride,
  parseJadwalError,
} from "@/service/jadwalLampuService";
import type {
  JadwalLampuAktif,
  JadwalErrorDetails,
} from "@/types/jadwalLampu";

interface AxiosErrorLike {
  status?: number;
  response?: {
    status?: number;
  };
}

/**
 * Hook untuk mengambil jadwal lampu aktif untuk node sensor tertentu.
 * Memiliki guard retry: Dilarang retry jika HTTP status 402 (Payment Required)
 * atau 404 (Belum ada jadwal / Not Found).
 */
export function useJadwalLampuAktif(sensorId?: string) {
  const cleanSensorId = sensorId?.trim() ?? "";
  const isEnabled = cleanSensorId.length > 0;

  const query = useQuery<JadwalLampuAktif | null, Error>({
    queryKey: QUERY_KEYS.jadwalLampu.aktif(cleanSensorId),
    queryFn: () => getJadwalLampuAktif(cleanSensorId),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount: number, error: Error) => {
      const err = error as unknown as AxiosErrorLike;
      const status = err.status ?? err.response?.status;
      // Guard: jangan retry untuk 402 (Payment Required) dan 404 (Not Found)
      if (status === 402 || status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const errorObj = query.error as unknown as AxiosErrorLike | null;
  const errorStatus = errorObj?.status ?? errorObj?.response?.status;

  return {
    jadwal: query.data ?? null,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? query.error.message : null,
    isNotFound: errorStatus === 404,
    isPaymentRequired: errorStatus === 402,
    refetch: query.refetch,
  };
}

export interface OverrideManualParams {
  jadwalAktif: JadwalLampuAktif;
  sensorId: string;
  intensitasCahaya: number; // 0 - 100
}

/**
 * Hook mutasi untuk beralih dari mode Auto ke mode Manual.
 * Secara pintar memilih:
 * - Kasus A (PUT /jadwal-lampu/{id}): jika jadwalAktif.sensor_id terisi (jadwal khusus blok).
 * - Kasus B (POST /jadwal-lampu): jika jadwalAktif.kebun_id terisi (jadwal kebun, dibuat override khusus blok).
 */
export function useOverrideJadwalManualMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    JadwalLampuAktif,
    JadwalErrorDetails,
    OverrideManualParams
  >({
    mutationFn: async ({ jadwalAktif, sensorId, intensitasCahaya }) => {
      try {
        const clampedBrightness = Math.round(
          Math.max(0, Math.min(100, intensitasCahaya)),
        );

        if (jadwalAktif.sensor_id) {
          // KASUS A: Jadwal khusus blok ini -> PUT ke ID jadwal lampu
          return await updateJadwalManual(jadwalAktif.id_jadwal_lampu, {
            mode: "manual",
            instensitas_cahaya: clampedBrightness,
          });
        }

        // KASUS B: Jadwal mengikuti kebun -> POST override khusus sensor ini
        return await createJadwalOverride({
          sensor_id: sensorId,
          jam_mulai_nyala: jadwalAktif.jam_mulai_nyala,
          jam_akhir_nyala: jadwalAktif.jam_akhir_nyala,
          mode: "manual",
          instensitas_cahaya: clampedBrightness,
        });
      } catch (err: unknown) {
        const errorDetails = parseJadwalError(err);
        throw errorDetails;
      }
    },
    onSuccess: (_data, variables) => {
      // Invalidate query jadwal aktif sensor terkait
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.jadwalLampu.aktif(variables.sensorId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.jadwalLampu.all,
      });
      // Invalidate detail node & dashboard
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.nodes.all,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.dashboard.all,
      });
    },
  });
}
