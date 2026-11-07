import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { ActiveScheduleItem } from '@/features/schedules/types/schedule.types';
import { farmService } from './farmService';
import { nodeService } from './nodeService';

/**
 * Kontrak Data Model Backend Jadwal Lampu (Tabel: jadwal_lampus)
 */
export interface JadwalLampuBackend {
  id_jadwal?: string;
  id_jadwal_lampu?: string;
  id?: string;
  nama_jadwal?: string;
  mode: 'manual' | 'auto';
  kebun_id: string | null;
  sensor_id: string | null;
  jam_mulai_nyala?: string;
  jam_akhir_nyala?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  status_aktif: boolean | number;
  hari?: string[] | string | null;
  // Typo di backend Laravel menggunakan 'instensitas_cahaya'
  instensitas_cahaya?: number | null;
  intensitas_cahaya?: number | null;
  target_lux?: number | null;
  intensitas_minimum?: number | null;
  baseline_manual_persen?: number | null;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
  kebun?: {
    id_kebun?: string;
    id?: string;
    nama_kebun?: string;
    lokasi_kebun?: string;
  } | null;
  sensor?: {
    id_sensor?: string;
    id?: string;
    kode_perangkat?: string;
    tipe_sensor?: string;
    blok_id?: string | null;
    blok?: {
      id_blok?: string;
      nama_blok?: string;
      kebun_id?: string;
    } | null;
  } | null;
}

export interface CreateJadwalLampuPayload {
  kebun_id?: string | null;
  sensor_id?: string | null;
  jam_mulai_nyala: string; // Format: "HH:mm" (24 jam)
  jam_akhir_nyala: string; // Format: "HH:mm" (24 jam)
  mode: 'manual' | 'auto';
  instensitas_cahaya?: number; // 0 - 100 untuk mode manual (typo backend dipertahankan)
  target_lux?: number; // >= 0 untuk mode auto
  intensitas_minimum?: number; // 0 - 100 untuk mode auto (default 10)
  baseline_manual_persen?: number; // 0 - 100 untuk mode auto (wajib)
  status_aktif?: boolean;
  keterangan?: string;
  nama_jadwal?: string;
  hari?: string[] | string;
  jam_mulai?: string;
  jam_selesai?: string;
}

export interface UpdateJadwalLampuPayload {
  jam_mulai_nyala?: string;
  jam_akhir_nyala?: string;
  mode?: 'manual' | 'auto';
  instensitas_cahaya?: number | null;
  target_lux?: number | null;
  intensitas_minimum?: number;
  baseline_manual_persen?: number;
  status_aktif?: boolean;
  keterangan?: string | null;
  kebun_id?: string | null;
  sensor_id?: string | null;
  nama_jadwal?: string;
  hari?: string[] | string;
  jam_mulai?: string;
  jam_selesai?: string;
}

export interface AutoDimmingPayload {
  nilai_lux: number;
  fase_bulan?: string | null;
}

export interface AutoDimmingLogBackend {
  id_log_peredupan: string;
  id?: string;
  sensor_id: string;
  presentase_redup: number; // Typo di tabel backend: presentase_redup
  nilai_lux: number;
  fase_bulan?: string | null;
  created_at?: string;
  sensor?: {
    kode_perangkat?: string;
  } | null;
}

/**
 * Kontrak Riwayat Auto-Dimming (Endpoint: GET /api/petani/log-peredupan)
 */
export interface LogPeredupanTitikItem {
  waktu: string;
  kecerahan_persen: number;
  lux: number;
  jumlah_sampel: number;
}

export interface LogPeredupanData {
  sensor_id: string;
  dari: string;
  sampai: string;
  interval_menit: number;
  titik: LogPeredupanTitikItem[];
}

export interface LogPeredupanResponse {
  status: string;
  message?: string;
  pesan?: string;
  data: LogPeredupanData;
}

export interface GetLogPeredupanParams {
  sensor_id: string;
  jam?: number;
  interval_menit?: number;
}

/**
 * Kontrak Ringkasan Jadwal Lampu (Endpoint: GET /api/petani/jadwal-lampu/ringkasan)
 */
export interface JadwalLampuDefaultKebun {
  id_jadwal_lampu: string;
  jam_mulai_nyala: string;
  jam_akhir_nyala: string;
  mode: 'manual' | 'auto';
  // Typo di backend Laravel menggunakan 'instensitas_cahaya'
  instensitas_cahaya?: number | null;
  intensitas_cahaya?: number | null;
  target_lux?: number | null;
  intensitas_minimum?: number | null;
  baseline_manual_persen?: number | null;
  status_aktif: boolean | number;
  keterangan?: string | null;
}

export type SumberJadwalLampu = 'override' | 'default' | 'belum_ada' | 'tanpa_node';

export interface JadwalLampuNodeItem {
  id_blok: string;
  nama_blok: string;
  id_sensor: string | null;
  kode_perangkat: string | null;
  status_koneksi: string | null;
  sumber: SumberJadwalLampu;
  jadwal: JadwalLampuDefaultKebun | JadwalLampuBackend | null;
}

export interface JadwalLampuRingkasanData {
  default_kebun: JadwalLampuDefaultKebun | null;
  node: JadwalLampuNodeItem[];
}

export interface JadwalLampuRingkasanResponse {
  status: 'succes' | 'success';
  pesan?: string;
  data: JadwalLampuRingkasanData;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/**
 * Helper untuk normalisasi respons array dari REST API Laravel
 */
const extractArray = <T>(res: unknown): T[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  const obj = res as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data as T[];
  if (obj.data && typeof obj.data === 'object') {
    const nested = (obj.data as Record<string, unknown>).data;
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
};

/**
 * Normalisasi format waktu menjadi format 24 jam ketat "HH:mm" (regex ^([01]\d|2[0-3]):[0-5]\d$).
 * Menangani format 12 jam (contoh: "06:00 PM" -> "18:00", "05:00 AM" -> "05:00"),
 * serta format waktu yang memiliki detik (contoh: "18:00:00" -> "18:00").
 */
export function normalizeTo24HourTime(timeStr?: string | null, fallback = '18:00'): string {
  if (!timeStr || typeof timeStr !== 'string') return fallback;
  const trimmed = timeStr.trim();
  if (!trimmed) return fallback;

  // Format 12-hour: contoh "06:00 PM", "6:00pm", "12:30 AM", "05:00 AM"
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const modifier = ampmMatch[3].toUpperCase();

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // Format 24-hour: contoh "18:00", "05:00", "18:00:00"
  const standardMatch = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (standardMatch) {
    const hours = parseInt(standardMatch[1], 10);
    const minutes = standardMatch[2];
    if (hours >= 0 && hours <= 23 && parseInt(minutes, 10) >= 0 && parseInt(minutes, 10) <= 59) {
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
  }

  return fallback;
}

/**
 * Service klien untuk mengelola Jadwal Lampu & Auto-Dimming
 * Terhubung langsung ke JadwalLampuController & AutoDimmingController
 */
export const scheduleService = {
  /**
   * Mengambil ringkasan status jadwal lampu per kebun dan node
   * Endpoint: GET /api/petani/jadwal-lampu/ringkasan?kebun_id=...&per_page=100
   */
  getRingkasan: async (kebunId: string, perPage = 100): Promise<JadwalLampuRingkasanResponse> => {
    return await apiClient.get<JadwalLampuRingkasanResponse>('/petani/jadwal-lampu/ringkasan', {
      params: { kebun_id: kebunId.trim(), per_page: perPage },
    });
  },

  /**
   * Menonaktifkan jadwal lampu (status_aktif: false)
   * Endpoint: PUT /api/petani/jadwal-lampu/{id}
   */
  deactivate: async (id: string): Promise<ApiResponse<JadwalLampuBackend>> => {
    return await apiClient.put<ApiResponse<JadwalLampuBackend>>(`/petani/jadwal-lampu/${id.trim()}`, {
      status_aktif: false,
    });
  },

  /**
   * Mengambil daftar jadwal lampu
   * Endpoint: GET /api/petani/jadwal-lampu?kebun_id=... atau ?sensor_id=...
   */
  getAll: async (params?: { kebun_id?: string; sensor_id?: string }): Promise<JadwalLampuBackend[]> => {
    try {
      // Jika params disediakan, tembak langsung dengan query params
      if (params?.kebun_id || params?.sensor_id) {
        const queryParams: Record<string, string> = {};
        if (params.kebun_id) queryParams.kebun_id = params.kebun_id.trim();
        if (params.sensor_id) queryParams.sensor_id = params.sensor_id.trim();

        const res = await apiClient.get<unknown>('/petani/jadwal-lampu', { params: queryParams });
        return extractArray<JadwalLampuBackend>(res);
      }

      // Jika params kosong, agregasi jadwal dari kebun yang tersedia untuk pengguna
      const farms = await farmService.getAll().catch(() => []);
      if (farms.length === 0) {
        return [];
      }

      const allSchedules: JadwalLampuBackend[] = [];
      for (const farm of farms) {
        if (!farm.id) continue;
        try {
          const res = await apiClient.get<unknown>('/petani/jadwal-lampu', {
            params: { kebun_id: farm.id },
          });
          const list = extractArray<JadwalLampuBackend>(res);
          allSchedules.push(...list);
        } catch {
          // Lanjutkan ke kebun berikutnya jika satu kebun kosong
        }
      }

      return allSchedules;
    } catch {
      return [];
    }
  },

  /**
   * Mengambil daftar jadwal lampu yang sudah dimapping ke format ActiveScheduleItem untuk tampilan tabel UI
   */
  getAllMapped: async (params?: { kebun_id?: string; sensor_id?: string }): Promise<ActiveScheduleItem[]> => {
    const rawList = await scheduleService.getAll(params);
    return rawList.map((item): ActiveScheduleItem => {
      const scheduleId = item.id_jadwal_lampu || item.id_jadwal || item.id || '';
      const isOverride = Boolean(item.sensor_id);
      const rawStart = item.jam_mulai_nyala || item.jam_mulai || '18:00';
      const rawEnd = item.jam_akhir_nyala || item.jam_selesai || '05:00';

      const blockLabel = item.sensor?.blok?.nama_blok;
      const deviceCode = item.sensor?.kode_perangkat;
      let nodeCode = 'Semua Node';

      if (isOverride) {
        if (blockLabel && deviceCode) {
          nodeCode = `${blockLabel} - ${deviceCode}`;
        } else if (deviceCode) {
          nodeCode = deviceCode;
        } else {
          nodeCode = item.nama_jadwal || 'Override Node';
        }
      } else {
        nodeCode = item.nama_jadwal || 'Default Seluruh Kebun';
      }

      const location = item.kebun?.nama_kebun || 'Kebun Buah Naga';
      const intensity =
        item.instensitas_cahaya ??
        item.intensitas_cahaya ??
        (item.mode === 'auto' ? (item.intensitas_minimum ?? 10) : 80);

      return {
        id: scheduleId,
        nodeCode,
        location,
        startTime: rawStart.substring(0, 5),
        endTime: rawEnd.substring(0, 5),
        intensity,
        mode: item.mode || 'manual',
        isOverride,
        targetLux: item.target_lux ?? null,
        intensitasMinimum: item.intensitas_minimum ?? 10,
        baselineManualPersen: item.baseline_manual_persen ?? null,
        statusAktif: Boolean(item.status_aktif ?? true),
      };
    });
  },

  /**
   * Mengambil jadwal aktif untuk sensor tertentu
   * Menggunakan endpoint GET /api/petani/jadwal-lampu yang selalu merespons 200 OK
   */
  getActive: async (sensorId: string, kebunId?: string): Promise<JadwalLampuBackend | null> => {
    if (!sensorId || !sensorId.trim()) return null;
    try {
      const cleanSensorId = sensorId.trim();
      const res = await apiClient.get<unknown>('/petani/jadwal-lampu', {
        params: { sensor_id: cleanSensorId },
      });
      const items = extractArray<JadwalLampuBackend>(res);
      const activeItem = items.find((item) => {
        const isStatusAktif = Boolean(item.status_aktif ?? (item as unknown as { is_aktif?: boolean }).is_aktif);
        if (!isStatusAktif) return false;

        const targetItemSensorId =
          item.sensor_id ??
          (item as unknown as { id_sensor?: string }).id_sensor ??
          (item as unknown as { node_id?: string }).node_id;

        if (targetItemSensorId && targetItemSensorId === cleanSensorId) {
          return true;
        }

        if (!targetItemSensorId && kebunId && item.kebun_id === kebunId) {
          return true;
        }

        return false;
      });

      return activeItem || null;
    } catch {
      return null;
    }
  },

  /**
   * Mengambil detail jadwal berdasarkan ID
   * Endpoint: GET /api/petani/jadwal-lampu/{id}
   */
  getById: async (id: string): Promise<JadwalLampuBackend | null> => {
    if (!id || !id.trim()) return null;
    try {
      const res = await apiClient.get<ApiResponse<JadwalLampuBackend>>(`/petani/jadwal-lampu/${id.trim()}`);
      return res?.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Membuat jadwal lampu baru
   * Endpoint: POST /api/petani/jadwal-lampu
   */
  create: async (payload: CreateJadwalLampuPayload): Promise<ApiResponse<JadwalLampuBackend>> => {
    const cleanStart = normalizeTo24HourTime(payload.jam_mulai_nyala || payload.jam_mulai, '18:00');
    const cleanEnd = normalizeTo24HourTime(payload.jam_akhir_nyala || payload.jam_selesai, '05:00');

    const body: Record<string, unknown> = {
      jam_mulai_nyala: cleanStart,
      jam_akhir_nyala: cleanEnd,
      mode: payload.mode === 'auto' ? 'auto' : 'manual',
    };

    if (payload.status_aktif !== undefined) {
      body.status_aktif = Boolean(payload.status_aktif);
    }

    if (payload.keterangan !== undefined && payload.keterangan.trim()) {
      body.keterangan = payload.keterangan.trim();
    }

    // Skop eksklusif: kebun_id ATAU sensor_id (hapus pasangan lainnya secara eksplisit)
    if (payload.sensor_id && payload.sensor_id.trim()) {
      body.sensor_id = payload.sensor_id.trim();
      delete body.kebun_id;
    } else if (payload.kebun_id && payload.kebun_id.trim()) {
      body.kebun_id = payload.kebun_id.trim();
      delete body.sensor_id;
    }

    // Sanitasi ketat mode
    if (body.mode === 'auto') {
      body.target_lux = Number(payload.target_lux ?? 150);
      body.intensitas_minimum = Number(payload.intensitas_minimum ?? 10);
      body.baseline_manual_persen = Number(payload.baseline_manual_persen ?? 70);
      delete body.instensitas_cahaya;
    } else {
      body.instensitas_cahaya = Number(payload.instensitas_cahaya ?? 80);
      delete body.target_lux;
      delete body.intensitas_minimum;
      delete body.baseline_manual_persen;
    }

    return await apiClient.post<ApiResponse<JadwalLampuBackend>>('/petani/jadwal-lampu', body);
  },

  /**
   * Memperbarui jadwal lampu
   * Endpoint: PUT /api/petani/jadwal-lampu/{id}
   */
  update: async (id: string, payload: UpdateJadwalLampuPayload): Promise<ApiResponse<JadwalLampuBackend>> => {
    const body: Record<string, unknown> = {};

    const rawStart = payload.jam_mulai_nyala || payload.jam_mulai;
    if (rawStart) body.jam_mulai_nyala = normalizeTo24HourTime(rawStart, '18:00');

    const rawEnd = payload.jam_akhir_nyala || payload.jam_selesai;
    if (rawEnd) body.jam_akhir_nyala = normalizeTo24HourTime(rawEnd, '05:00');

    if (payload.mode) body.mode = payload.mode;
    if (payload.status_aktif !== undefined) body.status_aktif = Boolean(payload.status_aktif);
    if (payload.keterangan !== undefined) body.keterangan = payload.keterangan ? payload.keterangan.trim() : null;

    // Skop eksklusif
    if (payload.sensor_id) {
      body.sensor_id = payload.sensor_id.trim();
      delete body.kebun_id;
    } else if (payload.kebun_id) {
      body.kebun_id = payload.kebun_id.trim();
      delete body.sensor_id;
    }

    // Sanitasi ketat mode
    if (body.mode === 'auto') {
      if (payload.target_lux !== undefined) body.target_lux = Number(payload.target_lux);
      if (payload.intensitas_minimum !== undefined) body.intensitas_minimum = Number(payload.intensitas_minimum);
      if (payload.baseline_manual_persen !== undefined) body.baseline_manual_persen = Number(payload.baseline_manual_persen);
      delete body.instensitas_cahaya;
    } else if (body.mode === 'manual') {
      if (payload.instensitas_cahaya !== undefined) body.instensitas_cahaya = Number(payload.instensitas_cahaya);
      delete body.target_lux;
      delete body.intensitas_minimum;
      delete body.baseline_manual_persen;
    }

    return await apiClient.put<ApiResponse<JadwalLampuBackend>>(`/petani/jadwal-lampu/${id.trim()}`, body);
  },

  /**
   * Menghapus jadwal lampu
   * Endpoint: DELETE /api/petani/jadwal-lampu/{id}
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await apiClient.delete<ApiResponse<null>>(`/petani/jadwal-lampu/${id.trim()}`);
  },

  /**
   * Memicu perhitungan auto-dimming sensor secara manual
   * Endpoint: POST /api/petani/sensor/{sensorId}/dimming
   */
  triggerDimming: async (sensorId: string, payload: AutoDimmingPayload): Promise<ApiResponse<AutoDimmingLogBackend>> => {
    return await apiClient.post<ApiResponse<AutoDimmingLogBackend>>(`/petani/sensor/${sensorId.trim()}/dimming`, {
      nilai_lux: payload.nilai_lux,
      fase_bulan: payload.fase_bulan || null,
    });
  },

  /**
   * Mengambil node sensor yang tersedia untuk dipilih di formulir jadwal
   */
  getAvailableNodesForSchedule: async () => {
    const farms = await farmService.getAll().catch(() => []);
    const result: Array<{
      id: string; // ID Sensor (UUID)
      code: string; // kode_perangkat
      location: string;
      status: string;
      farmId: string;
      blockId?: string;
      blockName?: string;
    }> = [];

    for (const farm of farms) {
      if (!farm.id) continue;
      const nodes = await nodeService.getAll(farm.id).catch(() => []);
      for (const node of nodes) {
        const blockName = node.blok?.nama_blok || 'Blok Lahan';
        result.push({
          id: node.id_sensor || node.id || '',
          code: node.kode_perangkat,
          location: `${farm.name} - ${blockName}`,
          status: node.status_koneksi === 'aktif' ? 'Aktif' : 'Maintenance',
          farmId: farm.id,
          blockId: node.blok_id || undefined,
          blockName,
        });
      }
    }

    return result;
  },

  /**
   * Mengambil riwayat log peredupan auto-dimming sensor (Kecerahan % dan Lux)
   * Endpoint: GET /api/petani/log-peredupan?sensor_id=...&jam=...&interval_menit=...
   */
  getLogPeredupan: async (params: GetLogPeredupanParams): Promise<LogPeredupanData | null> => {
    const rawId = (params.sensor_id || '').trim();
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);

    if (!isValidUuid) {
      return null;
    }

    const queryParams: Record<string, string | number> = {
      sensor_id: rawId,
    };
    if (params.jam !== undefined) {
      queryParams.jam = params.jam;
    }
    if (params.interval_menit !== undefined) {
      queryParams.interval_menit = params.interval_menit;
    }

    try {
      const res = await apiClient.get<ApiResponse<LogPeredupanData> | LogPeredupanData>('/petani/log-peredupan', {
        params: queryParams,
      });

      if (!res) return null;
      if ('data' in res && res.data && typeof res.data === 'object' && 'titik' in res.data) {
        return res.data as LogPeredupanData;
      }
      if ('titik' in res) {
        return res as LogPeredupanData;
      }
      return null;
    } catch {
      return null;
    }
  },
};
