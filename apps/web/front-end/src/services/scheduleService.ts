import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { ActiveScheduleItem } from '@/features/schedules/types/schedule.types';
import { farmService } from './farmService';
import { nodeService } from './nodeService';

/**
 * Kontrak Data Model Backend Jadwal Lampu (Tabel: jadwal_lampus)
 */
export interface JadwalLampuBackend {
  id_jadwal: string;
  id?: string;
  nama_jadwal: string;
  mode: 'manual' | 'auto';
  kebun_id: string | null;
  sensor_id: string | null;
  jam_mulai: string;
  jam_selesai: string;
  status_aktif: boolean | number;
  hari?: string[] | string | null;
  // Typo di backend Laravel menggunakan 'instensitas_cahaya'
  instensitas_cahaya?: number | null;
  intensitas_cahaya?: number | null;
  target_lux?: number | null;
  intensitas_minimum?: number | null;
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
  } | null;
}

export interface CreateJadwalLampuPayload {
  nama_jadwal: string;
  mode: 'manual' | 'auto';
  kebun_id?: string | null;
  sensor_id?: string | null;
  jam_mulai: string; // Format: "HH:mm"
  jam_selesai: string; // Format: "HH:mm"
  status_aktif?: boolean;
  hari?: string[] | string;
  instensitas_cahaya?: number; // 0 - 100 untuk mode manual
  target_lux?: number; // >= 0 untuk mode auto
  intensitas_minimum?: number; // 0 - 100 untuk mode auto
}

export type UpdateJadwalLampuPayload = Partial<CreateJadwalLampuPayload>;

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
 * Service klien untuk mengelola Jadwal Lampu & Auto-Dimming
 * Terhubung langsung ke JadwalLampuController & AutoDimmingController
 */
export const scheduleService = {
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
      const scheduleId = item.id_jadwal || item.id || '';
      const nodeCode = item.sensor?.kode_perangkat || item.nama_jadwal || 'Semua Node';
      const location = item.kebun?.nama_kebun || 'Kebun Buah Naga';
      const intensity = item.instensitas_cahaya ?? item.intensitas_cahaya ?? 80;

      return {
        id: scheduleId,
        nodeCode,
        location,
        startTime: item.jam_mulai ? item.jam_mulai.substring(0, 5) : '18:00',
        endTime: item.jam_selesai ? item.jam_selesai.substring(0, 5) : '05:00',
        intensity,
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
    // Sesuai check constraint di DB: salah satu dari kebun_id ATAU sensor_id wajib diisi (tidak boleh keduanya atau kosong)
    const body: Record<string, unknown> = {
      nama_jadwal: payload.nama_jadwal.trim(),
      mode: payload.mode || 'manual',
      jam_mulai: payload.jam_mulai.substring(0, 5),
      jam_selesai: payload.jam_selesai.substring(0, 5),
      status_aktif: payload.status_aktif !== undefined ? payload.status_aktif : true,
      hari: payload.hari || ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'],
    };

    if (payload.sensor_id && payload.sensor_id.trim()) {
      body.sensor_id = payload.sensor_id.trim();
    } else if (payload.kebun_id && payload.kebun_id.trim()) {
      body.kebun_id = payload.kebun_id.trim();
    }

    if (payload.mode === 'manual' || !payload.mode) {
      body.instensitas_cahaya = payload.instensitas_cahaya ?? 80;
    } else {
      body.target_lux = payload.target_lux ?? 350;
      if (payload.intensitas_minimum !== undefined) {
        body.intensitas_minimum = payload.intensitas_minimum;
      }
    }

    return await apiClient.post<ApiResponse<JadwalLampuBackend>>('/petani/jadwal-lampu', body);
  },

  /**
   * Memperbarui jadwal lampu
   * Endpoint: PUT /api/petani/jadwal-lampu/{id}
   */
  update: async (id: string, payload: UpdateJadwalLampuPayload): Promise<ApiResponse<JadwalLampuBackend>> => {
    const body: Record<string, unknown> = {};
    if (payload.nama_jadwal) body.nama_jadwal = payload.nama_jadwal.trim();
    if (payload.mode) body.mode = payload.mode;
    if (payload.jam_mulai) body.jam_mulai = payload.jam_mulai.substring(0, 5);
    if (payload.jam_selesai) body.jam_selesai = payload.jam_selesai.substring(0, 5);
    if (payload.status_aktif !== undefined) body.status_aktif = payload.status_aktif;
    if (payload.hari) body.hari = payload.hari;
    if (payload.instensitas_cahaya !== undefined) body.instensitas_cahaya = payload.instensitas_cahaya;
    if (payload.target_lux !== undefined) body.target_lux = payload.target_lux;
    if (payload.intensitas_minimum !== undefined) body.intensitas_minimum = payload.intensitas_minimum;

    if (payload.sensor_id) {
      body.sensor_id = payload.sensor_id;
    } else if (payload.kebun_id) {
      body.kebun_id = payload.kebun_id;
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
        });
      }
    }

    return result;
  },
};
