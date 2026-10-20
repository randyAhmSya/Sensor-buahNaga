import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';

/**
 * Kontrak dan Layanan Telemetri Sensor AgroLight
 * Mengambil data telemetri riil melalui endpoint Laravel:
 * GET /api/petani/telemetri?sensor_id=${sensorId}&limit=${limit}
 */

export interface ReadSensor {
  id?: string;
  id_read_sensor?: string;
  sensor_id: string;
  nilai_lux?: number;
  lux?: number;
  suhu?: number;
  temperature?: number;
  kelembapan?: number;
  humidity?: number;
  baterai?: number;
  battery?: number;
  kualitas_sinyal?: string;
  dicatat_pada: string;
  waktu_catat?: string;
  created_at?: string;
}

export type TelemetryLog = ReadSensor;

export type TelemetryRangeFilter = '24jam' | '7hari' | '30hari';

export interface TelemetryQueryFilter {
  rentang?: TelemetryRangeFilter;
  start_date?: string;
  end_date?: string;
  blok_id?: string;
  sensor_id?: string;
  kebun_id?: string;
}

/**
 * Normalisasi item pembacaan sensor agar kompatibel dengan ragam display di frontend
 */
export const normalizeReadSensor = (raw: Record<string, unknown>): ReadSensor => {
  const sensorId = String(raw.sensor_id || '');
  const id = String(raw.id_read_sensor || raw.id || '');
  const suhu = typeof raw.suhu === 'number' ? raw.suhu : typeof raw.temperature === 'number' ? raw.temperature : 0;
  const kelembapan = typeof raw.kelembapan === 'number' ? raw.kelembapan : typeof raw.humidity === 'number' ? raw.humidity : 0;
  const lux = typeof raw.nilai_lux === 'number' ? raw.nilai_lux : typeof raw.lux === 'number' ? raw.lux : 0;
  const baterai = typeof raw.baterai === 'number' ? raw.baterai : typeof raw.battery === 'number' ? raw.battery : 100;
  const sinyal = typeof raw.kualitas_sinyal === 'string' ? raw.kualitas_sinyal : 'Baik';
  const waktu = String(raw.dicatat_pada || raw.waktu_catat || raw.created_at || new Date().toISOString());

  return {
    id,
    id_read_sensor: id,
    sensor_id: sensorId,
    suhu,
    temperature: suhu,
    kelembapan,
    humidity: kelembapan,
    nilai_lux: lux,
    lux,
    baterai,
    battery: baterai,
    kualitas_sinyal: sinyal,
    dicatat_pada: waktu,
    waktu_catat: waktu,
    created_at: waktu,
  };
};

/**
 * Mengambil data riil telemetri sensor dari API backend Laravel
 * Endpoint: GET /api/petani/telemetri?sensor_id=${sensorId}&limit=${limit}
 */
export const fetchTelemetri = async (
  sensorId: string,
  limit: number = 100
): Promise<ReadSensor[]> => {
  if (
    !sensorId ||
    typeof sensorId !== 'string' ||
    !sensorId.trim() ||
    sensorId === 'Belum Terpasang' ||
    sensorId === 'undefined' ||
    sensorId === 'null'
  ) {
    return [];
  }

  try {
    const res = await apiClient.get<ApiResponse<unknown[]> | unknown[]>('/petani/telemetri', {
      params: {
        sensor_id: sensorId.trim(),
        limit,
      },
    });

    if (!res) return [];

    let rawList: unknown[] = [];
    if (Array.isArray(res)) {
      rawList = res;
    } else if (res && typeof res === 'object' && 'data' in res) {
      const dataPayload = (res as ApiResponse<unknown>).data;
      if (Array.isArray(dataPayload)) {
        rawList = dataPayload;
      } else if (dataPayload && typeof dataPayload === 'object' && 'data' in dataPayload) {
        const nested = (dataPayload as Record<string, unknown>).data;
        if (Array.isArray(nested)) rawList = nested;
      }
    }

    return rawList
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map(normalizeReadSensor);
  } catch (error) {
    console.error('Gagal mengambil data telemetri sensor:', error);
    return [];
  }
};

export const telemetryService = {
  fetchTelemetri,

  /**
   * Mengambil riwayat data telemetri sensor berdasarkan filter
   */
  getHistory: async (filter: TelemetryQueryFilter): Promise<ReadSensor[]> => {
    if (filter.sensor_id) {
      return await fetchTelemetri(filter.sensor_id);
    }
    return [];
  },

  /**
   * Mengambil pembacaan telemetri terakhir dari node sensor tertentu
   */
  getLatest: async (sensorId: string): Promise<ReadSensor | null> => {
    const logs = await fetchTelemetri(sensorId, 1);
    return logs.length > 0 ? logs[0] : null;
  },
};
