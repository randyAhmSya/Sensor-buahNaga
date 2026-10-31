import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppState } from "react-native";
import { useIsFocused } from "expo-router";
import {
  fetchMonitoringData,
  type MonitoringData,
  type NodeSummaryStats,
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
  isOffline: boolean;
}

export function useMonitoring(): UseMonitoringReturn {
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const {
    data,
    isPending,
    isError,
    error,
    refetch: queryRefetch,
    isPaused,
  } = useQuery<MonitoringData, Error>({
    queryKey: QUERY_KEYS.monitoring.all,
    queryFn: fetchMonitoringData,
    staleTime: 30000,
    refetchOnMount: false,
    refetchInterval: () => {
      // Polling hemat: hanya saat layar monitoring difokuskan & aplikasi aktif
      if (!isFocused || AppState.currentState !== "active") {
        return false;
      }
      return 30000; // 30 detik
    },
    refetchIntervalInBackground: false,
  });

  const isOffline = !!data && (isError || isPaused);

  const state: MonitoringState = useMemo(() => {
    // Sajikan data cache jika ada di storage/memori
    if (data) {
      return { status: "success", data, isOffline };
    }
    if (isPending) {
      return { status: "loading" };
    }
    if (isError) {
      return {
        status: "error",
        message: error?.message || "Gagal memuat data monitoring",
      };
    }
    return { status: "loading" };
  }, [isPending, isError, error, data, isOffline]);

  const summary = useMemo((): NodeSummaryStats => {
    if (data?.summary) {
      return data.summary;
    }
    return { total: 0, online: 0, offline: 0, belumTerlihat: 0 };
  }, [data]);

  const filteredGroups = useMemo((): MonitoringGroup[] => {
    if (state.status !== "success") return [];

    let groups = state.data.groups;

    // Filter berdasarkan status tab: all, active, inactive
    if (activeFilter === "active") {
      groups = groups
        .map((group) => ({
          ...group,
          nodes: group.nodes.filter(
            (node) =>
              node.statusKoneksi === "online" ||
              node.statusKoneksi === "terhubung" ||
              node.status === "normal",
          ),
        }))
        .filter((group) => group.nodes.length > 0);
    } else if (activeFilter === "inactive") {
      groups = groups
        .map((group) => ({
          ...group,
          nodes: group.nodes.filter(
            (node) =>
              node.statusKoneksi === "offline" ||
              node.statusKoneksi === "belum_pernah_terlihat" ||
              node.status === "problem",
          ),
        }))
        .filter((group) => group.nodes.length > 0);
    }

    // Filter berdasarkan search query
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
    isOffline,
  };
}
