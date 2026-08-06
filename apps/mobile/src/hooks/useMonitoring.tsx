import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchMonitoringData,
  type MonitoringData,
} from "@/service/monitoringService";
import type { MonitoringGroup } from "@/constant/monitoring";

type MonitoringState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: MonitoringData };

interface UseMonitoringReturn {
  state: MonitoringState;
  refetch: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilter: string;
  setActiveFilter: (key: string) => void;
  // Groups yang udah disaring berdasarkan searchQuery. Kosong kalau state
  // belum 'success' -- komponen gak perlu null-check manual.
  filteredGroups: MonitoringGroup[];
}

export function useMonitoring(): UseMonitoringReturn {
  const [state, setState] = useState<MonitoringState>({ status: "loading" });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("by-date");

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetchMonitoringData();
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Gagal memuat data monitoring",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // useMemo: filter cuma dihitung ulang kalau data atau kata kunci pencarian
  // berubah -- bukan tiap kali screen re-render karena state lain.
  // TODO BACKEND: kalau data node udah banyak (ratusan+), pindahin logic
  // filter ini ke server (kirim searchQuery sebagai query param di
  // fetchMonitoringData), bukan filter di client kayak sekarang.
  const filteredGroups = useMemo((): MonitoringGroup[] => {
    if (state.status !== "success") return [];

    const query = searchQuery.trim().toLowerCase();
    if (!query) return state.data.groups;

    return state.data.groups
      .map((group) => ({
        ...group,
        nodes: group.nodes.filter(
          (node) =>
            node.id.toLowerCase().includes(query) ||
            node.location.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.nodes.length > 0);
  }, [state, searchQuery]);

  return {
    state,
    refetch: load,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredGroups,
  };
}
