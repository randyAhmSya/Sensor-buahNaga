import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppState } from "react-native";
import { useIsFocused } from "expo-router";
import axios from "axios";
import {
  fetchDashboardData,
  type DashboardData,
} from "@/service/dashboardService";
import { QUERY_KEYS } from "@/constant/queryKeys";
import { authStorage, type AuthUser } from "@/service/authStorage";

// Discriminated union: status loading, success (dengan flag isOffline bila membaca cache saat sinyal buruk), dan error.
export type DashboardState =
  | { status: "loading" }
  | { status: "success"; data: DashboardData; isOffline: boolean }
  | { status: "error"; message: string };

function isPaymentRequiredError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 402;
  }
  return false;
}

export function useDashboard(kebunId?: string) {
  const isFocused = useIsFocused();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isPaused,
  } = useQuery<DashboardData, Error>({
    queryKey: kebunId ? [...QUERY_KEYS.dashboard.all, kebunId] : QUERY_KEYS.dashboard.all,
    queryFn: () => fetchDashboardData(kebunId),
    retry: (failureCount, err) => {
      if (isPaymentRequiredError(err)) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000,
    refetchOnMount: false,
    refetchInterval: () => {
      // Polling hemat: hanya aktif bila layar sedang difokuskan dan aplikasi aktif di foreground
      if (!isFocused || AppState.currentState !== "active") {
        return false;
      }
      return 30000; // 30 detik
    },
    refetchIntervalInBackground: false,
  });

  const isOffline = !!data && (isError || isPaused);

  const state: DashboardState = useMemo(() => {
    // Jika data ada di cache memori/AsyncStorage, sajikan data cache secara instan
    if (data) {
      return { status: "success", data, isOffline };
    }
    if (isLoading) {
      return { status: "loading" };
    }
    if (isError) {
      return {
        status: "error",
        message: error?.message || "Gagal memuat data dashboard.",
      };
    }
    return { status: "loading" };
  }, [isLoading, isError, error, data, isOffline]);

  // Ambil profil user aktif secara dinamis dari persistent authStorage
  const user: AuthUser | null = authStorage.getUser();

  const userName = user?.nama_lengkap || "Petani Buah Naga";
  const greetingName = user?.nama_lengkap
    ? user.nama_lengkap.trim().split(" ")[0]
    : "Petani";

  const today = useMemo(() => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  return {
    state,
    refetch,
    userName,
    greetingName,
    today,
    isOffline,
  };
}
