import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';

/**
 * Kontrak dan Layanan Log & Agregasi Konsumsi Energi AgroLight
 * Endpoint: GET /api/petani/log-energy?sensor_id=${sensorId}&limit=${limit}
 */

export interface EnergyLogHistoryItem {
  id: string;
  id_log?: string;
  sensor_id: string;
  konsumsi_watt: number;
  dicatat_pada: string;
}

export interface EnergyLogResponse {
  total_kwh: number;
  riwayat: EnergyLogHistoryItem[];
}

export interface EnergyLogItem {
  id: string;
  blok_id?: string;
  node_id?: string;
  daya_watt: number;
  kwh: number;
  durasi_menit?: number;
  biaya_listrik?: number;
  timestamp: string;
}

export interface EnergySummary {
  kwh: number;
  period: string;
  description: string;
  weeklyUsage: number[];
}

/**
 * Normalisasi item riwayat log energi
 */
export const normalizeEnergyHistoryItem = (raw: Record<string, unknown>): EnergyLogHistoryItem => {
  const id = String(raw.id_log || raw.id || '');
  const sensorId = String(raw.sensor_id || '');
  const watt = typeof raw.konsumsi_watt === 'number' ? raw.konsumsi_watt : 0;
  const waktu = String(raw.dicatat_pada || raw.created_at || new Date().toISOString());

  return {
    id,
    id_log: id,
    sensor_id: sensorId,
    konsumsi_watt: watt,
    dicatat_pada: waktu,
  };
};

/**
 * Mengambil log dan total konsumsi energi sensor dari backend Laravel
 * Endpoint: GET /api/petani/log-energy?sensor_id=${sensorId}&limit=${limit}
 */
export const fetchLogEnergy = async (
  sensorId: string,
  limit: number = 100
): Promise<EnergyLogResponse> => {
  if (
    !sensorId ||
    typeof sensorId !== 'string' ||
    !sensorId.trim() ||
    sensorId === 'Belum Terpasang' ||
    sensorId === 'undefined' ||
    sensorId === 'null'
  ) {
    return {
      total_kwh: 0,
      riwayat: [],
    };
  }

  try {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>> | Record<string, unknown>>('/petani/log-energy', {
      params: {
        sensor_id: sensorId.trim(),
        limit,
      },
    });

    if (!res) {
      return { total_kwh: 0, riwayat: [] };
    }

    const payload = (('data' in res && res.data && typeof res.data === 'object') ? res.data : res) as Record<string, unknown>;

    const rawKwh = payload?.total_kwh;
    const total_kwh =
      typeof rawKwh === 'number'
        ? rawKwh
        : typeof rawKwh === 'string'
        ? parseFloat(rawKwh) || 0
        : 0;

    const rawRiwayat = payload?.riwayat;
    const riwayat: EnergyLogHistoryItem[] = Array.isArray(rawRiwayat)
      ? rawRiwayat
          .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
          .map(normalizeEnergyHistoryItem)
      : [];

    return {
      total_kwh,
      riwayat,
    };
  } catch (error) {
    console.error('Gagal mengambil data log energy:', error);
    return {
      total_kwh: 0,
      riwayat: [],
    };
  }
};

export const energyService = {
  fetchLogEnergy,

  /**
   * Mengambil ringkasan konsumsi energi per sensor/blok
   */
  getBlockSummary: async (sensorIdOrBlockId: string): Promise<EnergySummary> => {
    try {
      const data = await fetchLogEnergy(sensorIdOrBlockId);
      return {
        kwh: data.total_kwh,
        period: 'Bulan Ini',
        description:
          data.total_kwh > 0
            ? 'Efisiensi pemakaian lampu aktif.'
            : 'Belum ada akumulasi konsumsi listrik tercatat periode ini.',
        weeklyUsage: [0, 0, 0, 0, 0, 0, 0],
      };
    } catch {
      return {
        kwh: 0,
        period: 'Bulan Ini',
        description: 'Belum ada akumulasi konsumsi listrik tercatat periode ini.',
        weeklyUsage: [0, 0, 0, 0, 0, 0, 0],
      };
    }
  },

  /**
   * Mengambil riwayat log energi
   */
  getLogs: async (params?: { blok_id?: string; sensor_id?: string }): Promise<EnergyLogItem[]> => {
    if (params?.sensor_id) {
      const res = await fetchLogEnergy(params.sensor_id);
      return res.riwayat.map((r) => ({
        id: r.id,
        node_id: r.sensor_id,
        daya_watt: r.konsumsi_watt,
        kwh: r.konsumsi_watt / 1000,
        timestamp: r.dicatat_pada,
      }));
    }
    return [];
  },
};
