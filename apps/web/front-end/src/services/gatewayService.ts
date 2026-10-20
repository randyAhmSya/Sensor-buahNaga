import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { GatewayBackend, CreateGatewayPayload, UpdateGatewayPayload } from '@/types/gateway.types';

export interface GatewayFilterParams {
  kebun_id?: string;
  blok_id?: string;
}

export const gatewayService = {
  /**
   * Mengambil daftar seluruh gateway dalam suatu kebun / blok
   * Endpoint: GET /api/petani/gateway
   */
  getAll: async (params?: GatewayFilterParams | string): Promise<GatewayBackend[]> => {
    let kebunId: string | undefined;
    let blokId: string | undefined;

    if (typeof params === 'string') {
      const trimmed = params.trim();
      if (trimmed && trimmed !== 'Semua Kebun' && trimmed !== 'undefined' && trimmed !== 'null') {
        kebunId = trimmed;
      }
    } else if (params) {
      if (params.kebun_id?.trim() && params.kebun_id !== 'Semua Kebun' && params.kebun_id !== 'undefined' && params.kebun_id !== 'null') {
        kebunId = params.kebun_id.trim();
      }
      if (params.blok_id?.trim() && params.blok_id !== 'undefined' && params.blok_id !== 'null') {
        blokId = params.blok_id.trim();
      }
    }

    // Backend endpoint GET /api/petani/gateway mewajibkan query parameter ?kebun_id={uuid}.
    // Jika kebun_id belum terisi, jangan tembak HTTP untuk mencegah 400 Bad Request.
    if (!kebunId) {
      return [];
    }

    try {
      const res = await apiClient.get<ApiResponse<GatewayBackend[]> | GatewayBackend[]>('/petani/gateway', {
        params: { kebun_id: kebunId },
      });

      let items: GatewayBackend[] = [];
      if (!res) {
        items = [];
      } else if (Array.isArray(res)) {
        items = res as GatewayBackend[];
      } else {
        const obj = res as unknown as Record<string, unknown>;
        if (Array.isArray(obj.data)) {
          items = obj.data as GatewayBackend[];
        } else if (obj.data && typeof obj.data === 'object') {
          const nested = (obj.data as Record<string, unknown>).data;
          if (Array.isArray(nested)) items = nested as GatewayBackend[];
        }
      }

      // Filter di sisi frontend jika blok_id ditentukan
      if (blokId) {
        items = items.filter((gw) => {
          const gwBlokId =
            gw.blok_id ??
            (gw as unknown as { blockId?: string }).blockId ??
            (gw as unknown as { blok?: { id_blok?: string; id?: string } }).blok?.id_blok ??
            (gw as unknown as { blok?: { id_blok?: string; id?: string } }).blok?.id;
          return String(gwBlokId) === String(blokId);
        });
      }

      return items;
    } catch {
      return [];
    }
  },

  getAllByKebun: async (kebunId: string): Promise<GatewayBackend[]> => {
    if (!kebunId || !kebunId.trim() || kebunId === 'undefined' || kebunId === 'null') return [];
    return gatewayService.getAll({ kebun_id: kebunId.trim() });
  },

  getByBlockId: async (blokId: string, kebunId?: string): Promise<GatewayBackend[]> => {
    if (!blokId || !blokId.trim() || blokId === 'undefined' || blokId === 'null') return [];
    if (!kebunId || !kebunId.trim() || kebunId === 'undefined' || kebunId === 'null') return [];
    return gatewayService.getAll({ blok_id: blokId.trim(), kebun_id: kebunId.trim() });
  },

  getById: async (id: string): Promise<GatewayBackend | null> => {
    if (!id || !id.trim()) return null;
    try {
      const res = await apiClient.get<ApiResponse<GatewayBackend>>(`/petani/gateway/${id}`);
      return res?.data || null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateGatewayPayload): Promise<ApiResponse<GatewayBackend>> => {
    const body: CreateGatewayPayload = {
      blok_id: payload.blok_id,
      kode_perangkat: payload.kode_perangkat,
      status_koneksi: payload.status_koneksi || 'belum_terhubung',
    };
    return await apiClient.post<ApiResponse<GatewayBackend>>('/petani/gateway', body);
  },

  update: async (id: string, payload: UpdateGatewayPayload): Promise<ApiResponse<GatewayBackend>> => {
    return await apiClient.put<ApiResponse<GatewayBackend>>(`/petani/gateway/${id}`, payload);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await apiClient.delete<ApiResponse<null>>(`/petani/gateway/${id}`);
  },
};
