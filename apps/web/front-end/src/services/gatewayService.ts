import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { GatewayBackend, CreateGatewayPayload, UpdateGatewayPayload } from '@/types/gateway.types';

export interface GatewayFilterParams {
  blok_id?: string;
  kebun_id?: string;
}

export const gatewayService = {
  getAll: async (params?: GatewayFilterParams | string): Promise<GatewayBackend[]> => {
    const queryParams: Record<string, string> = {};
    if (typeof params === 'string') {
      if (params.trim()) queryParams.blok_id = params.trim();
    } else if (params) {
      if (params.blok_id?.trim()) queryParams.blok_id = params.blok_id.trim();
      if (params.kebun_id?.trim()) queryParams.kebun_id = params.kebun_id.trim();
    }

    try {
      const res = await apiClient.get<unknown>('/petani/gateway', {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      });
      if (!res) return [];
      if (Array.isArray(res)) return res as GatewayBackend[];
      const obj = res as Record<string, unknown>;
      if (Array.isArray(obj.data)) return obj.data as GatewayBackend[];
      if (obj.data && typeof obj.data === 'object') {
        const nested = (obj.data as Record<string, unknown>).data;
        if (Array.isArray(nested)) return nested as GatewayBackend[];
      }
      return [];
    } catch {
      return [];
    }
  },

  getByBlockId: async (blokId: string): Promise<GatewayBackend[]> => {
    if (!blokId || !blokId.trim()) return [];
    return gatewayService.getAll({ blok_id: blokId.trim() });
  },

  getAllByKebun: async (kebunId: string): Promise<GatewayBackend[]> => {
    if (!kebunId || !kebunId.trim()) return [];
    return gatewayService.getAll({ kebun_id: kebunId.trim() });
  },

  getById: async (id: string): Promise<GatewayBackend | null> => {
    if (!id || !id.trim()) return null;
    try {
      const res = await apiClient.get<ApiResponse<GatewayBackend>>(`/petani/gateway/${id}`);
      return res.data;
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
