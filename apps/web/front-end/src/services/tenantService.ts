import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { TenantBackend, ToggleAdminAccessPayload } from '@/types/tenant.types';
import type { PetaniTenantAccessItem } from '@/types/tenantAccess.types';

export const tenantService = {
  toggleAdminAccess: async (isAdminAllowed: boolean): Promise<ApiResponse<TenantBackend>> => {
    const payload: ToggleAdminAccessPayload = { is_admin_allowed: isAdminAllowed };
    return await apiClient.patch<ApiResponse<TenantBackend>>('/petani/tenant/toggle-admin-access', payload);
  },

  /**
   * GET /petani/akses-tenant
   * Mengambil daftar permintaan izin akses dari Super Admin ke kebun petani
   */
  getAccessRequests: async (): Promise<PetaniTenantAccessItem[]> => {
    const res = await apiClient.get<ApiResponse<PetaniTenantAccessItem[]>>('/petani/akses-tenant');
    return res.data || [];
  },

  /**
   * PATCH /petani/akses-tenant/{id}/setujui
   * Memberikan izin inspeksi kebun kepada Super Admin
   */
  approveAccess: async (id: string | number): Promise<void> => {
    await apiClient.patch<ApiResponse<unknown>>(`/petani/akses-tenant/${id}/setujui`);
  },

  /**
   * PATCH /petani/akses-tenant/{id}/tolak
   * Menolak permintaan izin inspeksi kebun dengan alasan opsional
   */
  rejectAccess: async (id: string | number, alasan?: string): Promise<void> => {
    const payload = alasan?.trim() ? { alasan: alasan.trim() } : {};
    await apiClient.patch<ApiResponse<unknown>>(`/petani/akses-tenant/${id}/tolak`, payload);
  },

  /**
   * PATCH /petani/akses-tenant/{id}/cabut
   * Mencabut kembali izin akses inspeksi kebun yang sebelumnya telah disetujui
   */
  revokeAccess: async (id: string | number): Promise<void> => {
    await apiClient.patch<ApiResponse<unknown>>(`/petani/akses-tenant/${id}/cabut`);
  },
};
