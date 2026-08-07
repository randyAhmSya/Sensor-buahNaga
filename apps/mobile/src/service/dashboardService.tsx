import {
  MOCK_ACTION_ISSUE_GROUPS,
  MOCK_ACTIVITIES,
  MOCK_HARVEST_ESTIMATES,
  MOCK_STATS,
  MOCK_WEATHER,
  QUICK_ACTIONS,
  type ActionIssueGroup,
  type ActivityItem,
  type GardenStats,
  type HarvestEstimate,
  type QuickAction,
  type WeatherInfo,
} from "@/constant/dashboard";

export interface DashboardData {
  weather: WeatherInfo;
  stats: GardenStats;
  quickActions: QuickAction[];
  activities: ActivityItem[];
  harvestEstimates: HarvestEstimate[];
  actionIssueGroups: ActionIssueGroup[];
}

const MOCK_DELAY_MS = 600;

/**
 * TODO BACKEND: ganti isi function ini ke HTTP call asli. Signature & return
 * type JANGAN diubah -- hooks/useDashboard.ts dan semua komponen di
 * component/dashboard/* gak perlu disentuh selama shape DashboardData tetep sama.
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return {
    weather: MOCK_WEATHER,
    stats: MOCK_STATS,
    quickActions: QUICK_ACTIONS,
    activities: MOCK_ACTIVITIES,
    harvestEstimates: MOCK_HARVEST_ESTIMATES,
    actionIssueGroups: MOCK_ACTION_ISSUE_GROUPS,
  };
}
