import {
  MOCK_ACTIVITIES,
  MOCK_STATS,
  MOCK_WEATHER,
  QUICK_ACTIONS,
  type ActivityItem,
  type GardenStats,
  type QuickAction,
  type WeatherInfo,
} from "@/constant/dashboard";

// Bentuk data yang di-return function fetch di bawah. Ini KONTRAK antara
// service ini dengan hooks/useDashboard.ts -- selama backend beneran nanti
// balikin JSON dengan shape yang sama persis, gak ada satupun komponen di
// component/dashboard/* yang perlu diubah.
export interface DashboardData {
  weather: WeatherInfo;
  stats: GardenStats;
  quickActions: QuickAction[];
  activities: ActivityItem[];
}

// Delay buatan biar loading state (spinner, dst) di UI kepake & keliatan dari
// SEKARANG -- jadi pas ganti ke HTTP asli (yang emang ada latency-nya), gak ada
// kejutan UI yang belum pernah diuji kondisi loading-nya.
const MOCK_DELAY_MS = 600;

/**
 * ------------------------------------------------------------------------
 * TODO BACKEND: begitu API dashboard AgroLight udah jadi, ganti ISI function
 * ini aja (signature & return type-nya JANGAN diubah) jadi kayak:
 *
 *   export async function fetchDashboardData(): Promise<DashboardData> {
 *     const res = await fetch(`${API_BASE_URL}/dashboard`, {
 *       headers: { Authorization: `Bearer ${token}` },
 *     });
 *     if (!res.ok) throw new Error('Gagal memuat data dashboard');
 *     return res.json(); // pastikan response API match shape DashboardData di atas
 *   }
 *
 * Kalau response API beda nama field (misal backend nulis `active_nodes`
 * bukan `activeNodes`), mapping/transform-nya taruh DI SINI juga, sebelum
 * di-return -- biar komponen tetep konsumsi shape camelCase yang konsisten.
 * ------------------------------------------------------------------------
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return {
    weather: MOCK_WEATHER,
    stats: MOCK_STATS,
    quickActions: QUICK_ACTIONS,
    activities: MOCK_ACTIVITIES,
  };
}
