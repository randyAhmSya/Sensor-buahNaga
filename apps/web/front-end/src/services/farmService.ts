import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { KebunBackend } from '@/types/kebun.types';
import type { FarmItem } from '@/types/farm.types';
import type { BlockItem } from '@/types/block.types';
import { blockService } from './blockService';

export interface CreateFarmPayload {
  name: string;
  location: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  status: 'Aktif' | 'Inaktif';
  gpsCoordinates?: string;
  additionalNotes?: string;
  foto?: File;
}

const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url || !url.trim()) {
    return '';
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:8000';
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

import { getEntityId } from '@/utils/normalize';

export const mapKebunToFarmItem = (kebun: KebunBackend, blocks: BlockItem[] = []): FarmItem => {
  const photoUrl = resolveImageUrl(kebun.url_foto);
  const kebunId = getEntityId(kebun);
  const isStatusActive =
    kebun.status_kebun === true ||
    kebun.status_kebun === 1 ||
    String(kebun.status_kebun) === '1' ||
    String(kebun.status_kebun).toLowerCase() === 'aktif';

  return {
    id: kebunId,
    name: kebun.nama_kebun,
    location: kebun.lokasi_kebun || 'Lokasi belum diatur',
    description: kebun.keterangan || `Kebun buah naga di bawah naungan tenant ${kebun.tenant_id || 'AgroLight'}`,
    status: isStatusActive ? 'Aktif' : 'Inaktif',
    totalBlocks: blocks.length,
    imageUrl: photoUrl,
    bannerUrl: photoUrl,
    gpsCoordinates: '-8.591200, 114.283100',
    additionalNotes: 'Sistem pencahayaan otomatis terpasang',
    blocks: blocks,
  };
};

export const farmService = {
  getAll: async (tenantId?: string): Promise<FarmItem[]> => {
    try {
      const endpoint = tenantId ? `/admin/kebun` : `/petani/kebun`;
      const params = tenantId ? { tenant_id: tenantId } : undefined;

      const resKebun = await apiClient.get<ApiResponse<KebunBackend[]>>(endpoint, { params });

      if (resKebun && Array.isArray(resKebun.data) && resKebun.data.length > 0) {
        const farmsWithBlocks = await Promise.all(
          resKebun.data.map(async (kebun) => {
            const blocks = await blockService.getBlocksByFarmId(kebun.id_kebun).catch(() => []);
            return mapKebunToFarmItem(kebun, blocks);
          })
        );
        return farmsWithBlocks;
      }
      return [];
    } catch {
      // Tidak ada fallback ke mock data; return array kosong
      return [];
    }
  },

  getById: async (id: string): Promise<FarmItem | undefined> => {
    if (!id || id === 'farm-1') return undefined;
    try {
      const [resKebun, blocks] = await Promise.all([
        apiClient.get<ApiResponse<KebunBackend>>(`/petani/kebun/${id}`),
        blockService.getBlocksByFarmId(id).catch(() => []),
      ]);

      if (resKebun && resKebun.data) {
        return mapKebunToFarmItem(resKebun.data, blocks);
      }
    } catch {
      // Tidak ada fallback ke mock data
    }
    return undefined;
  },

  create: async (payload: CreateFarmPayload): Promise<{ success: boolean; id: string; farm: FarmItem }> => {
    const formData = new FormData();
    formData.append('nama_kebun', payload.name);
    if (payload.location) formData.append('lokasi_kebun', payload.location);
    formData.append('status_kebun', payload.status === 'Aktif' ? '1' : '0');

    if (payload.foto) {
      formData.append('foto', payload.foto);
    }

    const res = await apiClient.post<ApiResponse<KebunBackend>>('/petani/kebun', formData);
    const createdItem = mapKebunToFarmItem(res.data);
    return { success: true, id: createdItem.id, farm: createdItem };
  },

  update: async (id: string, payload: Partial<CreateFarmPayload>): Promise<{ success: boolean }> => {
    // Jika ada file foto, gunakan FormData dengan spoofing _method: 'PUT' untuk Laravel
    if (payload.foto) {
      const formData = new FormData();
      if (payload.name) formData.append('nama_kebun', payload.name);
      if (payload.location) formData.append('lokasi_kebun', payload.location);
      if (payload.status) formData.append('status_kebun', payload.status === 'Aktif' ? '1' : '0');
      formData.append('foto', payload.foto);
      formData.append('_method', 'PUT');

      await apiClient.post<ApiResponse<KebunBackend>>(`/petani/kebun/${id}`, formData);
      return { success: true };
    }

    // Jika tanpa upload file, kirim PUT langsung dengan JSON payload
    const body: Record<string, unknown> = {};
    if (payload.name) body.nama_kebun = payload.name;
    if (payload.location) body.lokasi_kebun = payload.location;
    if (payload.status) body.status_kebun = payload.status === 'Aktif' ? 1 : 0;

    try {
      await apiClient.put<ApiResponse<KebunBackend>>(`/petani/kebun/${id}`, body);
    } catch {
      // Fallback ke FormData dengan _method: 'PUT' jika endpoint mewajibkan format multipart
      const formData = new FormData();
      if (payload.name) formData.append('nama_kebun', payload.name);
      if (payload.location) formData.append('lokasi_kebun', payload.location);
      if (payload.status) formData.append('status_kebun', payload.status === 'Aktif' ? '1' : '0');
      formData.append('_method', 'PUT');
      await apiClient.post<ApiResponse<KebunBackend>>(`/petani/kebun/${id}`, formData);
    }
    return { success: true };
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    await apiClient.delete<ApiResponse<null>>(`/petani/kebun/${id}`);
    return { success: true };
  },
};
