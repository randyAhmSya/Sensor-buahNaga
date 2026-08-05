import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchDashboardData,
  type DashboardData,
} from "@/service/dashboardService";

// Discriminated union: cuma bisa 1 dari 3 kondisi ini yang aktif di satu waktu.
// Dibanding 3 variable terpisah (isLoading, error, data), ini nyegah kombinasi
// yang gak masuk akal -- misal "loading" tapi "error" juga ke-set bersamaan.
// TypeScript juga bisa "narrow" otomatis: begitu status === 'success' dicek,
// TS udah tau `data` pasti ada, gak perlu null-check manual lagi di komponen.
type DashboardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: DashboardData };

interface UseDashboardReturn {
  greetingName: string;
  today: string;
  state: DashboardState;
  // Dipanggil dari UI kalau ada tombol "Coba Lagi" pas error, atau pull-to-refresh
  refetch: () => void;
}

/**
 * Satu hook yang jadi sumber data buat seluruh Dashboard screen.
 * Semua data lewat fetchDashboardData() dari service/dashboardService.ts --
 * hook ini SAMA SEKALI gak tau (dan gak perlu tau) itu dari mock atau API asli.
 * Kalau nanti backend jadi, file ini TIDAK PERLU diubah sama sekali.
 */
export function useDashboard(): UseDashboardReturn {
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetchDashboardData();
      setState({ status: "success", data });
    } catch (err) {
      // err instanceof Error dicek dulu karena throw di JS bisa aja bukan Error object
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Gagal memuat data dashboard",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  return {
    greetingName: "Farmers",
    today,
    state,
    refetch: load,
  };
}
