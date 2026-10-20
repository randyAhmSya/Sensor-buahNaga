import { apiClient } from './api';
import type {
  AdminApiResponse,
  AdminDashboardSummary,
  AdminTenantItem,
  AdminTransactionItem,
  AdminAuditLogItem,
  PaginatedListResult,
  AdminUserItem,
  CreateUserPayload,
  UpdateUserPayload,
  UserFilterParams,
  PaketLanggananItem,
  CreatePackagePayload,
  UpdatePackagePayload,
  GatewayInspectionItem,
  StatusLampuBlok,
} from '@/types/admin.types';
import type { KebunBackend } from '@/types/farm.types';
import type { BlokBackend } from '@/types/block.types';
import type { NodeSensorBackend } from '@/types/node.types';

/**
 * Standard Query Keys Factory untuk Web Portal Super Admin
 * Sesuai pedoman TanStack Query v5
 */
export const queryKeys = {
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    tenants: (page: number) => ['admin', 'tenants', page] as const,
    transaksi: (status: string, page: number) => ['admin', 'transaksi', status, page] as const,
    logs: (page: number) => ['admin', 'logs', page] as const,
    users: (page = 1, filters?: UserFilterParams) => ['admin', 'users', page, filters] as const,
    paket: ['admin', 'paket'] as const,
    inspection: {
      farms: (tenantId: string) => ['admin', 'inspection', tenantId, 'farms'] as const,
      blocks: (tenantId: string, kebunId: string) => ['admin', 'inspection', tenantId, 'blocks', kebunId] as const,
      nodes: (tenantId: string, kebunId: string) => ['admin', 'inspection', tenantId, 'nodes', kebunId] as const,
      lampStatus: (tenantId: string, blokId: string | number) => ['admin', 'inspection', tenantId, 'lamp-status', blokId] as const,
      gateways: (tenantId: string, kebunId?: string) => ['admin', 'inspection', tenantId, 'gateways', kebunId] as const,
    },
  },
};

export const adminService = {
  /**
   * 1. GET /admin/dashboard/ringkasan
   * Mengambil metrik menyeluruh dan 10 aktivitas admin terbaru
   */
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const res = await apiClient.get<AdminApiResponse<AdminDashboardSummary>>('/admin/dashboard/ringkasan');
    const raw = res?.data ?? ({} as AdminDashboardSummary);

    return {
      ...raw,
      pengguna: raw.pengguna ?? (raw.user ? {
        total: raw.user.total,
        petani_biasa: raw.user.per_role?.petani ?? 0,
        super_admin: raw.user.per_role?.superAdmin ?? 0,
      } : undefined),
      transaksi_keuangan: raw.transaksi_keuangan ?? (raw.transaksi ? {
        total_transaksi: raw.transaksi.total,
        menunggu_pembayaran: raw.transaksi.menunggu_pembayaran,
        diverifikasi: raw.transaksi.diverifikasi,
        ditolak: raw.transaksi.ditolak,
        total_pendapatan: raw.transaksi.pendapatan_total,
      } : undefined),
      infrastruktur: {
        ...raw.infrastruktur,
        total_kebun: raw.infrastruktur?.total_kebun ?? raw.infrastruktur?.kebun?.total ?? 0,
        total_blok: raw.infrastruktur?.total_blok ?? raw.infrastruktur?.blok?.total ?? 0,
      },
    };
  },

  /**
   * 2. GET /admin/tenant?per_page=15&page={page}
   * Mengambil daftar tenant dengan paginasi server-side
   */
  async getTenants(page = 1, perPage = 15): Promise<PaginatedListResult<AdminTenantItem>> {
    const res = await apiClient.get<AdminApiResponse<AdminTenantItem[]>>('/admin/tenant', {
      params: { page, per_page: perPage },
    });
    return {
      data: res.data || [],
      meta: res.meta || {
        current_page: page,
        per_page: perPage,
        total: (res.data || []).length,
        last_page: 1,
      },
    };
  },

  /**
   * 3. PATCH /admin/tenant/{id}/nonaktifkan & PATCH /admin/tenant/{id}/aktifkan
   * Mengubah status aktif / nonaktif tenant
   */
  async toggleTenantStatus(id: string | number, activate: boolean): Promise<void> {
    const endpoint = activate
      ? `/admin/tenant/${id}/aktifkan`
      : `/admin/tenant/${id}/nonaktifkan`;
    await apiClient.patch<AdminApiResponse<unknown>>(endpoint);
  },

  /**
   * 4. POST /admin/tenant/{id}/minta-akses
   * Mengajukan izin inspeksi kebun tenant kepada pemilik kebun
   */
  async requestTenantAccess(id: string | number, alasan?: string): Promise<void> {
    const payload = alasan?.trim() ? { alasan: alasan.trim() } : {};
    await apiClient.post<AdminApiResponse<unknown>>(`/admin/tenant/${id}/minta-akses`, payload);
  },

  /**
   * 4b. GET /admin/akses-tenant/riwayat
   * Mengambil riwayat pengajuan izin akses tenant oleh Super Admin
   */
  async getAccessRequestsHistory(): Promise<import('@/types/tenantAccess.types').AdminTenantAccessItem[]> {
    const res = await apiClient.get<AdminApiResponse<import('@/types/tenantAccess.types').AdminTenantAccessItem[]>>(
      '/admin/akses-tenant/riwayat'
    );
    return res.data || [];
  },

  /**
   * 5. GET /admin/langganan/transaksi?status={status}&page={page}
   * Mengambil daftar transaksi pembayaran langganan berdasarkan status
   */
  async getTransactions(
    status = 'menunggu_verifikasi',
    page = 1
  ): Promise<PaginatedListResult<AdminTransactionItem>> {
    const res = await apiClient.get<AdminApiResponse<AdminTransactionItem[]>>('/admin/langganan/transaksi', {
      params: { status, page },
    });
    return {
      data: res.data || [],
      meta: res.meta || {
        current_page: page,
        per_page: 15,
        total: (res.data || []).length,
        last_page: 1,
      },
    };
  },

  /**
   * 6. PATCH /admin/langganan/transaksi/{id}/verifikasi
   * Memverifikasi transaksi pembayaran langganan
   */
  async verifyTransaction(id: string | number): Promise<void> {
    await apiClient.patch<AdminApiResponse<unknown>>(`/admin/langganan/transaksi/${id}/verifikasi`);
  },

  /**
   * 7. PATCH /admin/langganan/transaksi/{id}/tolak
   * Menolak transaksi langganan dengan alasan wajib
   */
  async rejectTransaction(id: string | number, alasan: string): Promise<void> {
    await apiClient.patch<AdminApiResponse<unknown>>(`/admin/langganan/transaksi/${id}/tolak`, {
      alasan,
    });
  },

  /**
   * 8. GET /admin/langganan/transaksi/{id}/bukti-transfer
   * Mengunduh blob bukti transfer dengan Bearer token dan mengonversi ke Object URL
   */
  async getTransactionProofBlobUrl(id: string | number): Promise<string> {
    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
      ? import.meta.env.VITE_API_BASE_URL
      : 'http://localhost:8000/api';
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const url = `${cleanBase}/admin/langganan/transaksi/${id}/bukti-transfer`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('agro_auth_token') : null;
    const headers: Record<string, string> = {
      Accept: 'image/*, application/json, */*',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Gagal memuat bukti transfer (${response.status})`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  /**
   * 9. GET /admin/log-aktivitas?page={page}
   * Mengambil audit trail log aktivitas seluruh Super Admin
   */
  async getAuditLogs(page = 1): Promise<PaginatedListResult<AdminAuditLogItem>> {
    const res = await apiClient.get<AdminApiResponse<AdminAuditLogItem[]>>('/admin/log-aktivitas', {
      params: { page },
    });
    return {
      data: res.data || [],
      meta: res.meta || {
        current_page: page,
        per_page: 15,
        total: (res.data || []).length,
        last_page: 1,
      },
    };
  },

  /**
   * 10. GET /admin/user
   * Mengambil daftar akun pengguna dengan filter role, status, dan pencarian nama/email
   */
  async getUsers(params?: UserFilterParams): Promise<PaginatedListResult<AdminUserItem>> {
    const cleanParams: Record<string, string | number | boolean> = {};
    if (params?.page) cleanParams.page = params.page;
    if (params?.per_page) cleanParams.per_page = params.per_page;
    if (params?.role && params.role !== 'ALL') cleanParams.role = params.role;
    if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
    if (params?.is_aktif !== undefined && params.is_aktif !== 'ALL') {
      cleanParams.is_aktif = params.is_aktif === true || params.is_aktif === 'true';
    }

    let res: AdminApiResponse<AdminUserItem[]>;
    try {
      res = await apiClient.get<AdminApiResponse<AdminUserItem[]>>('/admin/user', {
        params: cleanParams,
      });
    } catch (err: unknown) {
      // Fallback endpoint jika backend memakai /admin/users
      const isNotFound = err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404;
      if (isNotFound) {
        res = await apiClient.get<AdminApiResponse<AdminUserItem[]>>('/admin/users', {
          params: cleanParams,
        });
      } else {
        throw err;
      }
    }

    return {
      data: res.data || [],
      meta: res.meta || {
        current_page: params?.page || 1,
        per_page: params?.per_page || 15,
        total: (res.data || []).length,
        last_page: 1,
      },
    };
  },

  /**
   * 11. POST /admin/user
   * Membuat akun pengguna baru (petani_biasa atau superAdmin)
   */
  async createUser(payload: CreateUserPayload): Promise<AdminUserItem> {
    try {
      const res = await apiClient.post<AdminApiResponse<AdminUserItem>>('/admin/user', payload);
      return res.data;
    } catch (err: unknown) {
      const isNotFound = err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404;
      if (isNotFound) {
        const res = await apiClient.post<AdminApiResponse<AdminUserItem>>('/admin/users', payload);
        return res.data;
      }
      throw err;
    }
  },

  /**
   * 12. PUT /admin/user/{id}
   * Memperbarui profil atau kredensial pengguna
   */
  async updateUser(id: string | number, payload: UpdateUserPayload): Promise<AdminUserItem> {
    try {
      const res = await apiClient.put<AdminApiResponse<AdminUserItem>>(`/admin/user/${id}`, payload);
      return res.data;
    } catch (err: unknown) {
      const isNotFound = err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404;
      if (isNotFound) {
        const res = await apiClient.put<AdminApiResponse<AdminUserItem>>(`/admin/users/${id}`, payload);
        return res.data;
      }
      throw err;
    }
  },

  /**
   * 13. PATCH /admin/user/{id}/aktifkan & PATCH /admin/user/{id}/nonaktifkan
   * Mengubah status aktif / nonaktif user
   */
  async toggleUserStatus(id: string | number, activate: boolean): Promise<void> {
    const endpoint = activate
      ? `/admin/user/${id}/aktifkan`
      : `/admin/user/${id}/nonaktifkan`;
    try {
      await apiClient.patch<AdminApiResponse<unknown>>(endpoint);
    } catch (err: unknown) {
      // Fallback ke /admin/users jika ada konfigurasi berbeda
      const isNotFound = err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404;
      if (isNotFound) {
        const fallbackUrl = activate
          ? `/admin/users/${id}/aktifkan`
          : `/admin/users/${id}/nonaktifkan`;
        await apiClient.patch<AdminApiResponse<unknown>>(fallbackUrl);
      } else {
        throw err;
      }
    }
  },

  /**
   * 14. GET /admin/paket-langganan (atau /petani/langganan/paket)
   * Mengambil seluruh katalog paket langganan
   */
  async getPackages(): Promise<PaketLanggananItem[]> {
    try {
      const res = await apiClient.get<AdminApiResponse<PaketLanggananItem[]>>('/admin/paket-langganan');
      return res.data || [];
    } catch {
      const fallback = await apiClient.get<AdminApiResponse<PaketLanggananItem[]>>('/petani/langganan/paket');
      return fallback.data || [];
    }
  },

  /**
   * 15. POST /admin/paket-langganan
   * Menambahkan paket langganan baru ke dalam katalog
   */
  async createPackage(payload: CreatePackagePayload): Promise<PaketLanggananItem> {
    const res = await apiClient.post<AdminApiResponse<PaketLanggananItem>>('/admin/paket-langganan', payload);
    return res.data;
  },

  /**
   * 16. PUT /admin/paket-langganan/{id}
   * Mengedit data paket langganan
   */
  async updatePackage(id: string | number, payload: UpdatePackagePayload): Promise<PaketLanggananItem> {
    const res = await apiClient.put<AdminApiResponse<PaketLanggananItem>>(`/admin/paket-langganan/${id}`, payload);
    return res.data;
  },

  /**
   * 17. DELETE /admin/paket-langganan/{id}
   * Menghapus paket langganan dari katalog
   */
  async deletePackage(id: string | number): Promise<void> {
    await apiClient.delete<AdminApiResponse<unknown>>(`/admin/paket-langganan/${id}`);
  },

  /**
   * 18. PATCH /admin/paket-langganan/{id}/aktifkan & PATCH /admin/paket-langganan/{id}/nonaktifkan
   * Mengubah status aktif katalog paket
   */
  async togglePackageStatus(id: string | number, statusAktif: boolean): Promise<void> {
    const endpoint = statusAktif
      ? `/admin/paket-langganan/${id}/aktifkan`
      : `/admin/paket-langganan/${id}/nonaktifkan`;
    await apiClient.patch<AdminApiResponse<unknown>>(endpoint);
  },

  /**
   * 19. GET /admin/kebun?tenant_id={tenantId}
   * Mengambil daftar kebun tenant dalam mode inspeksi
   */
  async getTenantFarms(tenantId: string): Promise<KebunBackend[]> {
    try {
      const res = await apiClient.get<AdminApiResponse<KebunBackend[]>>('/admin/kebun', {
        params: { tenant_id: tenantId },
      });
      return res.data || [];
    } catch (err: unknown) {
      // Jika 403 Forbidden atau error consent, lempar ke atas agar ditangkap komponen
      const isConsentForbidden = err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 403;
      if (isConsentForbidden) {
        throw err;
      }
      // Fallback ke /petani/kebun?tenant_id=...
      const res = await apiClient.get<AdminApiResponse<KebunBackend[]>>('/petani/kebun', {
        params: { tenant_id: tenantId },
      });
      return res.data || [];
    }
  },

  /**
   * 20. GET /admin/blok?kebun_id={kebunId}&tenant_id={tenantId}
   * Mengambil daftar blok kebun tenant dalam mode inspeksi
   */
  async getTenantBlocks(tenantId: string, kebunId: string): Promise<BlokBackend[]> {
    const res = await apiClient.get<AdminApiResponse<BlokBackend[]>>('/admin/blok', {
      params: { kebun_id: kebunId, tenant_id: tenantId },
    });
    return res.data || [];
  },

  /**
   * 21. GET /admin/node?kebun_id={kebunId}&tenant_id={tenantId}
   * Mengambil daftar node sensor dan kode QR kebun tenant
   */
  async getTenantNodes(tenantId: string, kebunId: string): Promise<NodeSensorBackend[]> {
    const res = await apiClient.get<AdminApiResponse<NodeSensorBackend[]>>('/admin/node', {
      params: { kebun_id: kebunId, tenant_id: tenantId },
    });
    return res.data || [];
  },

  /**
   * 22. GET /petani/blok/{blokId}/status-lampu?tenant_id={tenantId}
   * Mengambil status lampu dan heartbeat blok tenant
   */
  async getTenantLampStatus(tenantId: string, blokId: string | number): Promise<StatusLampuBlok> {
    const res = await apiClient.get<AdminApiResponse<StatusLampuBlok>>(`/petani/blok/${blokId}/status-lampu`, {
      params: { tenant_id: tenantId },
    });
    return res.data;
  },

  /**
   * 23. GET /admin/gateway?kebun_id={kebunId}&tenant_id={tenantId}
   * Mengambil daftar gateway kebun tenant
   */
  async getTenantGateways(tenantId: string, kebunId?: string): Promise<GatewayInspectionItem[]> {
    try {
      const res = await apiClient.get<AdminApiResponse<GatewayInspectionItem[]>>('/admin/gateway', {
        params: { tenant_id: tenantId, ...(kebunId ? { kebun_id: kebunId } : {}) },
      });
      return res.data || [];
    } catch {
      return [];
    }
  },
};
