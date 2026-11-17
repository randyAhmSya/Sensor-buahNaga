import { useState, useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import apiClient from "@/service/apiClient";
import { POLLING_CHART_MS } from "@/constant/polling";

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
  const isFocused = useIsFocused();
  const [isAppActive, setIsAppActive] = useState<boolean>(() => {
    return AppState.currentState === "active";
  });

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        setIsAppActive(nextAppState === "active");
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const shouldPoll = isFocused && isAppActive;

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
    staleTime: Math.floor(POLLING_CHART_MS / 2),
    refetchOnMount: "always",
    refetchInterval: () => (!shouldPoll ? false : POLLING_CHART_MS),
    refetchIntervalInBackground: false,
  });
}
