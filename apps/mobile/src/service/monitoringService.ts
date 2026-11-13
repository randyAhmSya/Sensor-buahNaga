import {
  FILTER_OPTIONS,
  type FilterOption,
  type MonitoringGroup,
} from "@/constant/monitoring";
import {
  fetchDashboardData,
  type DashboardData,
} from "./dashboardService";
import {
  mapDashboardToMonitoringData,
  type MonitoringNodeItemPayload,
} from "./mappers/monitoringMapper";

export interface NodeSummaryStats {
  total: number;
  online: number;
  offline: number;
  belumTerlihat: number;
}

export interface MonitoringData {
  groups: MonitoringGroup[];
  filters: FilterOption[];
  summary: NodeSummaryStats;
  kebunNama?: string;
}

/**
 * Mengonsumsi data monitoring kebun aktif secara efisien dari agregasi Dashboard.
 * Tidak melakukan request terpisah ke /petani/node atau /petani/telemetri.
 */
export async function fetchMonitoringData(kebunId?: string): Promise<MonitoringData> {
  const dashboard = await fetchDashboardData(kebunId);
  const data = mapDashboardToMonitoringData(dashboard);
  return {
    ...data,
    kebunNama: dashboard.kebunInfo.nama_kebun,
  };
}
