import { authStorage } from "./authStorage";
import {
  PROFILE_MENU,
  type ProfileMenuItem,
  type UserProfile,
} from "@/constant/profile";
import type { BackendKebunDTO } from "@/types/api";
import { mapToProfileData } from "./mappers/profileMapper";
import { ensureKebunList } from "./kebunService";
import { queryClient } from "@/lib/queryClient";
import { QUERY_KEYS } from "@/constant/queryKeys";
import type { DashboardData } from "./dashboardService";
import type { MonitoringData } from "./monitoringService";

export interface ProfileData {
  user: UserProfile;
  menu: ProfileMenuItem[];
}

/**
 * Mengonsumsi data profil user dan ringkasan kebun/node dari API Backend Laravel (AgroLight) via DTO & Mapper.
 * Memanfaatkan cache deduplikasi TanStack Query untuk kebun dan statistik node tanpa loop request ganda.
 */
export async function fetchProfileData(): Promise<ProfileData> {
  const currentUser = authStorage.getUser();

  let kebuns: BackendKebunDTO[] = [];
  try {
    kebuns = await ensureKebunList();
  } catch {
    kebuns = [];
  }

  // Ambil total node dari cache dashboard atau monitoring tanpa perlu memicu loop /petani/node
  let activeNodesCount = 0;
  const cachedDashboard = queryClient.getQueryData<DashboardData>(QUERY_KEYS.dashboard.all);
  if (cachedDashboard?.ringkasan?.jumlah_node !== undefined) {
    activeNodesCount = cachedDashboard.ringkasan.jumlah_node;
  } else {
    const allQueries = queryClient.getQueryCache().findAll({ queryKey: QUERY_KEYS.dashboard.all });
    for (const q of allQueries) {
      const d = q.state.data as DashboardData | undefined;
      if (d?.ringkasan?.jumlah_node !== undefined) {
        activeNodesCount = d.ringkasan.jumlah_node;
        break;
      }
    }
  }

  if (activeNodesCount === 0) {
    const cachedMonitoring = queryClient.getQueryData<MonitoringData>(QUERY_KEYS.monitoring.all);
    if (cachedMonitoring?.summary?.total !== undefined) {
      activeNodesCount = cachedMonitoring.summary.total;
    }
  }

  return mapToProfileData({
    currentUser,
    kebuns,
    activeNodesCount,
  });
}
