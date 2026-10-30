import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { NodeSensorBackend, CreateNodePayload, UpdateNodePayload } from '@/types/node.types';
import { farmService } from './farmService';

// In-flight promise cache untuk deduplikasi request simultan GET /api/petani/node?kebun_id=UUID
const inFlightNodeRequests = new Map<string, Promise<NodeSensorBackend[]>>();

export const nodeService = {
  /**
   * Mengambil daftar semua node sensor milik tenant (wajib menyertakan query param kebun_id)
   * Endpoint: GET /api/petani/node?kebun_id=UUID
   */
  getAll: async (kebunId?: string): Promise<NodeSensorBackend[]> => {
    let targetKebunId = kebunId?.trim();

    // Jika kebunId kosong atau 'Semua Kebun', ambil ID kebun aktif pertama dari farmService
    if (
      !targetKebunId ||
      targetKebunId === 'Semua Kebun' ||
      targetKebunId === 'undefined' ||
      targetKebunId === 'null'
    ) {
      try {
        const farms = await farmService.getAll();
        if (farms.length > 0 && farms[0]?.id) {
          targetKebunId = farms[0].id;
        } else {
          return [];
        }
      } catch {
        return [];
      }
    }

    if (!targetKebunId) {
      return [];
    }

    const cacheKey = targetKebunId.trim();
    const existing = inFlightNodeRequests.get(cacheKey);
    if (existing) {
      return existing;
    }

    const fetchPromise = (async (): Promise<NodeSensorBackend[]> => {
      try {
        const params = { kebun_id: targetKebunId.trim() };
        const res = await apiClient.get<ApiResponse<NodeSensorBackend[]> | NodeSensorBackend[]>('/petani/node', {
          params,
        });

        if (!res) return [];
        if (Array.isArray(res)) return res as NodeSensorBackend[];
        const obj = res as unknown as Record<string, unknown>;
        if (Array.isArray(obj.data)) {
          return obj.data as NodeSensorBackend[];
        }
        if (obj.data && typeof obj.data === 'object') {
          const nestedData = (obj.data as Record<string, unknown>).data;
          if (Array.isArray(nestedData)) {
            return nestedData as NodeSensorBackend[];
          }
        }
        if (Array.isArray(obj.nodes)) {
          return obj.nodes as NodeSensorBackend[];
        }
        return [];
      } catch {
        return [];
      } finally {
        setTimeout(() => {
          inFlightNodeRequests.delete(cacheKey);
        }, 5000);
      }
    })();

    inFlightNodeRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  },

  /**
   * Mengambil detail spesifik satu node sensor
   * Endpoint: GET /api/petani/node/{id}
   */
  getById: async (id: string): Promise<NodeSensorBackend | null> => {
    if (!id || !id.trim()) return null;
    try {
      const res = await apiClient.get<ApiResponse<NodeSensorBackend>>(`/petani/node/${id}`);
      return res?.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Menyimpan node sensor baru
   * Endpoint: POST /api/petani/node
   */
  create: async (payload: CreateNodePayload): Promise<ApiResponse<NodeSensorBackend>> => {
    const body: Record<string, unknown> = {
      kode_perangkat: payload.kode_perangkat.trim(),
      blok_id: payload.blok_id.trim(),
      gateway_id: payload.gateway_id.trim(),
      tipe_sensor: payload.tipe_sensor ? payload.tipe_sensor.trim() : 'cahaya_lux',
      status_koneksi: payload.status_koneksi || 'offline',
    };

    // Hard-guard: Hapus key terlarang yang dapat memicu error validasi atau 500 di backend
    delete body.qr_id;
    delete body.kode_pairing;
    delete body.token_perangkat;

    return await apiClient.post<ApiResponse<NodeSensorBackend>>('/petani/node', body);
  },

  /**
   * Mengupdate data node sensor
   * Endpoint: PUT /api/petani/node/{id}
   */
  update: async (id: string, payload: UpdateNodePayload): Promise<ApiResponse<NodeSensorBackend>> => {
    if (!id || !id.trim()) {
      throw new Error('ID sensor (UUID) diperlukan untuk memperbarui node.');
    }

    const cleanId = id.trim();
    const body: Record<string, unknown> = {};

    if (payload.kode_perangkat !== undefined) {
      body.kode_perangkat = payload.kode_perangkat.trim();
    }
    if (payload.gateway_id !== undefined) {
      body.gateway_id = payload.gateway_id ? payload.gateway_id.trim() : null;
    }
    if (payload.tipe_sensor !== undefined) {
      body.tipe_sensor = payload.tipe_sensor.trim();
    }
    if (payload.status_koneksi !== undefined) {
      body.status_koneksi = payload.status_koneksi.trim();
    }

    // Hard-guard: Jangan pernah mengirim blok_id, qr_id, kode_pairing, token_perangkat pada PUT
    delete body.blok_id;
    delete body.qr_id;
    delete body.kode_pairing;
    delete body.token_perangkat;

    return await apiClient.put<ApiResponse<NodeSensorBackend>>(`/petani/node/${cleanId}`, body);
  },

  /**
   * Menghapus node sensor
   * Endpoint: DELETE /api/petani/node/{id}
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    if (!id || !id.trim()) {
      throw new Error('ID sensor (UUID) diperlukan untuk menghapus node.');
    }
    return await apiClient.delete<ApiResponse<null>>(`/petani/node/${id.trim()}`);
  },

  /**
   * Menghasilkan kode QR baru untuk node sensor
   * Endpoint: POST /api/petani/node/{id}/generate-qr
   */
  generateNewQr: async (id: string): Promise<ApiResponse<NodeSensorBackend>> => {
    if (!id || !id.trim()) {
      throw new Error('ID sensor (UUID) diperlukan untuk membuat QR baru.');
    }
    return await apiClient.post<ApiResponse<NodeSensorBackend>>(`/petani/node/${id.trim()}/generate-qr`);
  },
};
