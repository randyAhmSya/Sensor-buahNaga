import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppState } from "react-native";
import { useIsFocused } from "expo-router";
import {
  fetchDashboardData,
  type DashboardData,
} from "@/service/dashboardService";
import { mapDashboardToMonitoringData } from "@/service/mappers/monitoringMapper";
import type {
  MonitoringData,
  NodeSummaryStats,
} from "@/service/monitoringService";
import type { MonitoringGroup } from "@/constant/monitoring";
import { QUERY_KEYS } from "@/constant/queryKeys";

export type MonitoringState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: MonitoringData; isOffline: boolean };

export interface UseMonitoringReturn {
  state: MonitoringState;
  refetch: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilter: string;
  setActiveFilter: (key: string) => void;
  filteredGroups: MonitoringGroup[];
  summary: NodeSummaryStats;
  kebunNama?: string;
  isOffline: boolean;
}

/**
 * Hook pemantauan node sensor:
 * - Mengonsumsi cache dashboard pada key query yang sama dengan Home.
 * - Menerapkan polling hemat 30 detik hanya saat layar Monitoring difokuskan dan aplikasi aktif di foreground.
 * - Memetakan filter: Aktif = online, Nonaktif = offline + belum pernah terlihat.
 */
export function useMonitoring(kebunId?: string): UseMonitoringReturn {
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const queryKey = kebunId
    ? [...QUERY_KEYS.dashboard.all, kebunId]
    : QUERY_KEYS.dashboard.all;

  const {
    data: dashboardData,
    isPending,
    isError,
    error,
    refetch: queryRefetch,
    isPaused,
  } = useQuery<DashboardData, Error>({
    queryKey,
    queryFn: () => fetchDashboardData(kebunId),
    staleTime: 30000,
    refetchOnMount: false,
    refetchInterval: () => {
      // Polling hemat: hanya saat layar monitoring difokuskan & aplikasi aktif di foreground
      if (!isFocused || AppState.currentState !== "active") {
        return false;
      }
      return 30000; // 30 detik
    },
    refetchIntervalInBackground: false,
  });

  const isOffline = !!dashboardData && (isError || isPaused);

  const monitoringData = useMemo(() => {
    if (!dashboardData) return null;
    const mapped = mapDashboardToMonitoringData(dashboardData);
    return {
      ...mapped,
      kebunNama: dashboardData.kebunInfo.nama_kebun,
    };
  }, [dashboardData]);

  const state: MonitoringState = useMemo(() => {
    if (monitoringData) {
      return { status: "success", data: monitoringData, isOffline };
    }
    if (isPending) {
      return { status: "loading" };
    }
    if (isError) {
      return {
        status: "error",
        message: error?.message || "Gagal memuat data monitoring kebun",
      };
    }
    return { status: "loading" };
  }, [monitoringData, isPending, isError, error, isOffline]);

  const summary = useMemo((): NodeSummaryStats => {
    if (monitoringData?.summary) {
      return monitoringData.summary;
    }
    return { total: 0, online: 0, offline: 0, belumTerlihat: 0 };
  }, [monitoringData]);

  const filteredGroups = useMemo((): MonitoringGroup[] => {
    if (state.status !== "success") return [];

    let groups = state.data.groups;

    // Filter status: Aktif = online, Nonaktif = offline + belum_pernah_terlihat
    if (activeFilter === "active") {
      groups = groups
        .map((group) => ({
          ...group,
          nodes: group.nodes.filter((node) => node.statusKoneksi === "online"),
        }))
        .filter((group) => group.nodes.length > 0);
    } else if (activeFilter === "inactive") {
      groups = groups
        .map((group) => ({
          ...group,
          nodes: group.nodes.filter(
            (node) =>
              node.statusKoneksi === "offline" ||
              node.statusKoneksi === "belum_pernah_terlihat",
          ),
        }))
        .filter((group) => group.nodes.length > 0);
    }

    // Filter pencarian berdasarkan kode perangkat, lokasi blok, atau ID
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      groups = groups
        .map((group) => ({
          ...group,
          nodes: group.nodes.filter(
            (node) =>
              node.code.toLowerCase().includes(q) ||
              node.location.toLowerCase().includes(q) ||
              node.id.toLowerCase().includes(q),
          ),
        }))
        .filter((group) => group.nodes.length > 0);
    }

    return groups;
  }, [state, activeFilter, searchQuery]);

  const refetch = async () => {
    await queryRefetch();
  };

  return {
    state,
    refetch,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredGroups,
    summary,
    kebunNama: dashboardData?.kebunInfo.nama_kebun,
    isOffline,
  };
}
