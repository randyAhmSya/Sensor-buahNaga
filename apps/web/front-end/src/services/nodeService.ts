import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { NodeSensorBackend, CreateNodePayload, UpdateNodePayload } from '@/types/node.types';

export const nodeService = {
  /**
   * Mengambil daftar semua node sensor milik tenant (wajib menyertakan query param kebun_id)
   * Endpoint: GET /api/petani/node?kebun_id=UUID
   */
  getAll: async (kebunId?: string): Promise<NodeSensorBackend[]> => {
    // JANGAN menembak endpoint tanpa parameter kebun_id valid untuk mencegah HTTP 400 Bad Request
    if (
      !kebunId ||
      typeof kebunId !== 'string' ||
      !kebunId.trim() ||
      kebunId === 'Semua Kebun' ||
      kebunId === 'undefined' ||
      kebunId === 'null'
    ) {
      return [];
    }

    try {
      const params = { kebun_id: kebunId.trim() };
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
    }
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
    const body: CreateNodePayload = {
      ...payload,
      tipe_sensor: payload.tipe_sensor || 'lux_suhu',
      status_koneksi: payload.status_koneksi || 'aktif',
    };
    return await apiClient.post<ApiResponse<NodeSensorBackend>>('/petani/node', body);
  },

  /**
   * Mengupdate data node sensor
   * Endpoint: PUT /api/petani/node/{id}
   */
  update: async (id: string, payload: UpdateNodePayload): Promise<ApiResponse<NodeSensorBackend>> => {
    return await apiClient.put<ApiResponse<NodeSensorBackend>>(`/petani/node/${id}`, payload);
  },

  /**
   * Menghapus node sensor
   * Endpoint: DELETE /api/petani/node/{id}
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await apiClient.delete<ApiResponse<null>>(`/petani/node/${id}`);
  },
};
