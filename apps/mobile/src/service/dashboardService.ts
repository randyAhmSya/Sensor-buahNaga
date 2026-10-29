import apiClient from './apiClient';
import axios from 'axios';
import type {
  ActionIssueGroup,
  ActivityItem,
  GardenStats,
  HarvestEstimate,
  QuickAction,
  WeatherInfo,
} from '@/constant/dashboard';
import type {
  BackendKebunDTO,
  BackendSensorDTO,
  BackendReadSensorDTO,
  BackendSiklusPanenDTO,
} from '@/types/api';
import type { BlokLampuSummary, BlokStatusLampuDTO } from '@/types/notification';
import { mapToDashboardData } from './mappers/dashboardMapper';

export interface BackendBlokDTO {
  id_blok: string;
  nama_blok: string;
  kebun_id: string;
  deskripsi?: string | null;
  luas_m2?: number | null;
  url_foto?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardData {
  weather: WeatherInfo;
  stats: GardenStats;
  quickActions: QuickAction[];
  activities: ActivityItem[];
  harvestEstimates: HarvestEstimate[];
  actionIssueGroups: ActionIssueGroup[];
  blokLampuSummaries: BlokLampuSummary[];
}

/**
 * Mengonsumsi data nyata dari API Backend Laravel (AgroLight) melalui DTO dan Mapper:
 * - GET /api/petani/kebun
 * - GET /api/petani/node
 * - GET /api/petani/telemetri
 * - GET /api/petani/siklus-panen (per blok lahan dengan query param blok_id)
 * - GET /api/petani/blok/{id}/status-lampu (per blok via Promise.allSettled dengan 402 guard)
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  // 1. Ambil daftar kebun milik tenant petani
  const kebunRes = await apiClient.get<{ status: string; data: BackendKebunDTO[] }>(
    '/petani/kebun',
  );
  const kebuns: BackendKebunDTO[] = kebunRes.data?.data || [];

  let allNodes: BackendSensorDTO[] = [];
  let telemetryList: BackendReadSensorDTO[] = [];
  let siklusList: BackendSiklusPanenDTO[] = [];
  let blokList: Array<BackendBlokDTO & { nama_kebun: string }> = [];

  // 2. Ambil data nodes dan blok dari setiap kebun
  if (kebuns.length > 0) {
    const nodePromises = kebuns.map((k) =>
      apiClient
        .get<{ status: string; data: BackendSensorDTO[] }>('/petani/node', {
          params: { kebun_id: k.id_kebun },
        })
        .then((res: { data?: { data?: BackendSensorDTO[] } }) => res.data?.data || [])
        .catch(() => [] as BackendSensorDTO[]),
    );

    const blokPromises = kebuns.map((k) =>
      apiClient
        .get<{ status: string; data: BackendBlokDTO[] }>('/petani/blok', {
          params: { kebun_id: k.id_kebun },
        })
        .then((res: { data?: { data?: BackendBlokDTO[] } }) =>
          (res.data?.data || []).map((b: BackendBlokDTO) => ({ ...b, nama_kebun: k.nama_kebun })),
        )
        .catch(() => [] as Array<BackendBlokDTO & { nama_kebun: string }>),
    );

    const [nodeResults, blokResults] = await Promise.all([
      Promise.all(nodePromises),
      Promise.all(blokPromises),
    ]);

    allNodes = nodeResults.flat();
    blokList = blokResults.flat();
  }

  // 3. Ambil ringkasan status lampu per blok menggunakan Promise.allSettled & 402 Guard
  const blokLampuSummaries: BlokLampuSummary[] = [];
  if (blokList.length > 0) {
    let is402Encountered = false;

    const settled = await Promise.allSettled(
      blokList.map(async (blok) => {
        if (is402Encountered) return null;
        try {
          const res = await apiClient.get<{
            status: string;
            data: BlokStatusLampuDTO;
          }>(`/petani/blok/${blok.id_blok}/status-lampu`);

          const statusData = res.data?.data;
          if (!statusData) return null;

          const total = Number(statusData.jumlah_lampu || 0);
          const online = Number(statusData.jumlah_online || 0);
          const offline = Number(statusData.jumlah_offline || 0);
          const batas = Number(statusData.batas_offline_detik || 90);
          const persentase = total > 0 ? Math.round((online / total) * 100) : 0;

          let statusKoneksi: 'optimal' | 'sebagian_offline' | 'semua_offline' | 'kosong' = 'optimal';
          if (total === 0) {
            statusKoneksi = 'kosong';
          } else if (online === 0) {
            statusKoneksi = 'semua_offline';
          } else if (offline > 0) {
            statusKoneksi = 'sebagian_offline';
          }

          const summary: BlokLampuSummary = {
            idBlok: blok.id_blok,
            namaBlok: blok.nama_blok,
            namaKebun: blok.nama_kebun,
            jumlahLampu: total,
            jumlahOnline: online,
            jumlahOffline: offline,
            batasOfflineDetik: batas,
            persentaseOnline: persentase,
            statusKoneksi,
          };
          return summary;
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response?.status === 402) {
            is402Encountered = true;
          }
          return null;
        }
      }),
    );

    for (const item of settled) {
      if (item.status === 'fulfilled' && item.value) {
        blokLampuSummaries.push(item.value);
      }
    }
  }

  // 4. Ambil telemetri sensor terakhir jika node tersedia
  const activeSensor =
    allNodes.find(
      (n) => n.status_koneksi === 'online' || n.status_koneksi === 'terhubung',
    ) || allNodes[0];

  if (activeSensor) {
    try {
      const telemetriRes = await apiClient.get<{
        status: string;
        data: BackendReadSensorDTO[];
      }>('/petani/telemetri', {
        params: { sensor_id: activeSensor.id_sensor, limit: 10 },
      });
      telemetryList = telemetriRes.data?.data || [];
    } catch {
      telemetryList = [];
    }
  }

  // 5. Ambil siklus panen riil lintas blok lahan (kontrak query param: blok_id)
  if (blokList.length > 0) {
    const siklusPromises = blokList.map((b) =>
      apiClient
        .get<{ status: string; data: BackendSiklusPanenDTO[] }>(
          '/petani/siklus-panen',
          { params: { blok_id: b.id_blok } },
        )
        .then((res: { data?: { data?: BackendSiklusPanenDTO[] } }) =>
          (res.data?.data || []).map((s: BackendSiklusPanenDTO) => ({
            ...s,
            blok: {
              id_blok: b.id_blok,
              nama_blok: b.nama_blok,
              kebun: { id_kebun: b.kebun_id, nama_kebun: b.nama_kebun },
            },
          })),
        )
        .catch(() => [] as BackendSiklusPanenDTO[]),
    );

    const settledSiklus = await Promise.allSettled(siklusPromises);
    siklusList = settledSiklus
      .filter((item): item is PromiseFulfilledResult<BackendSiklusPanenDTO[]> => item.status === 'fulfilled')
      .flatMap((item) => item.value);
  }

  // 6. Transformasikan data DTO mentah menggunakan pure mapper
  return mapToDashboardData({
    kebuns,
    allNodes,
    telemetryList,
    siklusList,
    blokLampuSummaries,
  });
}