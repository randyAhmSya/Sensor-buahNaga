import {
  FILTER_OPTIONS,
  MOCK_MONITORING_GROUPS,
  type FilterOption,
  type MonitoringGroup,
} from "@/constant/monitoring";

export interface MonitoringData {
  groups: MonitoringGroup[];
  filters: FilterOption[];
}

const MOCK_DELAY_MS = 500;

/**
 * TODO BACKEND: ganti isi function ini ke HTTP call asli. Kalau nanti filter
 * ("Semua"/"Hari Ini"/dst) sebaiknya diproses server-side (bukan di-filter di
 * client kayak sekarang), function ini bisa nerima parameter filter/search
 * dan diteruskan sebagai query string ke API.
 */
export async function fetchMonitoringData(): Promise<MonitoringData> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return {
    groups: MOCK_MONITORING_GROUPS,
    filters: FILTER_OPTIONS,
  };
}
