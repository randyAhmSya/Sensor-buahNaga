import { useQuery } from "@tanstack/react-query";
import apiClient from "@/service/apiClient";

export interface LogPeredupanPoint {
  waktu: string;
  kecerahan_persen: number;
  lux: number;
  jumlah_sampel: number;
}

export interface LogPeredupanResponse {
  sensor_id: string;
  dari: string;
  sampai: string;
  interval_menit: number;
  titik: LogPeredupanPoint[];
}

export function useLogPeredupan(
  sensorId?: string,
  jam: number = 12,
  enabled: boolean = true,
) {
  return useQuery<LogPeredupanResponse, Error>({
    queryKey: ["log-peredupan", sensorId, jam],
    queryFn: async () => {
      if (!sensorId) throw new Error("Sensor ID tidak valid");
      const res = await apiClient.get<{
        status: string;
        data: LogPeredupanResponse;
      }>("/petani/log-peredupan", {
        params: {
          sensor_id: sensorId,
          jam,
          interval_menit: 10,
        },
      });
      return res.data.data;
    },
    enabled: Boolean(sensorId && enabled),
    staleTime: 60_000,
    refetchIntervalInBackground: false,
  });
}
