import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMonitoringData,
  type MonitoringData,
} from "@/service/monitoringService";
import type { MonitoringGroup } from "@/constant/monitoring";
import { QUERY_KEYS } from "@/constant/queryKeys";

export type MonitoringState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: MonitoringData };

export interface UseMonitoringReturn {
  state: MonitoringState;
  refetch: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilter: string;
  setActiveFilter: (key: string) => void;
  filteredGroups: MonitoringGroup[];
}

export function useMonitoring(): UseMonitoringReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const {
    data,
    isPending,
    isError,
    error,
    refetch: queryRefetch,
  } = useQuery<MonitoringData, Error>({
    queryKey: QUERY_KEYS.monitoring.all,
    queryFn: fetchMonitoringData,
  });

  const state: MonitoringState = useMemo(() => {
    if (isPending) {
      return { status: "loading" };
    }
    if (isError) {
      return {
        status: "error",
        message: error?.message || "Gagal memuat data monitoring",
      };
    }
    if (data) {
      return { status: "success", data };
    }
    return { status: "loading" };
  }, [isPending, isError, error, data]);

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
              node.statusKoneksi !== "online" &&
              node.statusKoneksi !== "terhubung",
          ),
        }))
        .filter((group) => group.nodes.length > 0);
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return groups;

    return groups
      .map((group) => ({
        ...group,
        nodes: group.nodes.filter(
          (node) =>
            node.id.toLowerCase().includes(query) ||
            node.code.toLowerCase().includes(query) ||
            node.location.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.nodes.length > 0);
  }, [state, searchQuery, activeFilter]);

  const refetch = async (): Promise<void> => {
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
  };
}
