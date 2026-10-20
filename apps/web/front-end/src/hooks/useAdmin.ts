import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, queryKeys } from '@/services/adminService';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES } from '@/config/constants';
import type {
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
 * Hook untuk memuat data ringkasan dashboard Super Admin
 */
export function useAdminDashboard() {
  return useQuery<AdminDashboardSummary, Error>({
    queryKey: queryKeys.admin.dashboard,
    queryFn: () => adminService.getDashboardSummary(),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook untuk memuat daftar tenant dengan paginasi
 */
export function useAdminTenants(page = 1) {
  return useQuery<PaginatedListResult<AdminTenantItem>, Error>({
    queryKey: queryKeys.admin.tenants(page),
    queryFn: () => adminService.getTenants(page),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook untuk memuat daftar transaksi langganan berdasarkan filter status & halaman
 */
export function useAdminTransactions(status = 'menunggu_verifikasi', page = 1) {
  return useQuery<PaginatedListResult<AdminTransactionItem>, Error>({
    queryKey: queryKeys.admin.transaksi(status, page),
    queryFn: () => adminService.getTransactions(status, page),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook untuk memuat audit trail log aktivitas admin
 */
export function useAdminLogs(page = 1) {
  return useQuery<PaginatedListResult<AdminAuditLogItem>, Error>({
    queryKey: queryKeys.admin.logs(page),
    queryFn: () => adminService.getAuditLogs(page),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutasi untuk mengubah status tenant (aktif / nonaktif)
 */
export function useToggleTenantStatus() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string | number; activate: boolean }>({
    mutationFn: ({ id, activate }) => adminService.toggleTenantStatus(id, activate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'admin' &&
          (query.queryKey[1] === 'tenants' || query.queryKey[1] === 'dashboard'),
      });
    },
  });
}

/**
 * Query untuk mengambil riwayat pengajuan izin akses tenant oleh Super Admin
 */
export function useAdminAccessHistoryQuery(options?: { enabled?: boolean }) {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
  const isEnabled = (options?.enabled ?? true) && isSuperAdmin;

  return useQuery<import('@/types/tenantAccess.types').AdminTenantAccessItem[], Error>({
    queryKey: ['admin', 'akses-tenant', 'riwayat'],
    queryFn: () => adminService.getAccessRequestsHistory(),
    staleTime: 30 * 1000,
    enabled: isEnabled,
  });
}

/**
 * Mutasi untuk meminta izin inspeksi kebun tenant
 */
export function useRequestTenantAccess() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string | number; alasan?: string }>({
    mutationFn: ({ id, alasan }) => adminService.requestTenantAccess(id, alasan),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'admin' &&
          (query.queryKey[1] === 'tenants' ||
            (query.queryKey[1] === 'akses-tenant' && query.queryKey[2] === 'riwayat')),
      });
    },
  });
}

/**
 * Mutasi untuk memverifikasi transaksi langganan
 */
export function useVerifyTransaction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string | number }>({
    mutationFn: ({ id }) => adminService.verifyTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'admin' &&
          (query.queryKey[1] === 'transaksi' || query.queryKey[1] === 'dashboard'),
      });
    },
  });
}

/**
 * Mutasi untuk menolak transaksi langganan dengan alasan wajib
 */
export function useRejectTransaction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string | number; alasan: string }>({
    mutationFn: ({ id, alasan }) => adminService.rejectTransaction(id, alasan),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'admin' &&
          (query.queryKey[1] === 'transaksi' || query.queryKey[1] === 'dashboard'),
      });
    },
  });
}

/**
 * Hook untuk memuat daftar user dengan paginasi dan filter
 */
export function useAdminUsers(params?: UserFilterParams) {
  const page = params?.page || 1;
  return useQuery<PaginatedListResult<AdminUserItem>, Error>({
    queryKey: queryKeys.admin.users(page, params),
    queryFn: () => adminService.getUsers(params),
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutasi untuk membuat pengguna baru
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminUserItem, Error, CreateUserPayload>({
    mutationFn: (payload) => adminService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'admin' &&
          (query.queryKey[1] === 'users' || query.queryKey[1] === 'dashboard'),
      });
    },
  });
}

/**
 * Mutasi untuk mengedit pengguna
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<AdminUserItem, Error, { id: string | number; payload: UpdateUserPayload }>({
    mutationFn: ({ id, payload }) => adminService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] === 'users',
      });
    },
  });
}

/**
 * Mutasi untuk mengubah status user (aktif / nonaktif)
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string | number; activate: boolean }>({
    mutationFn: ({ id, activate }) => adminService.toggleUserStatus(id, activate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'admin' &&
          (query.queryKey[1] === 'users' || query.queryKey[1] === 'dashboard'),
      });
    },
  });
}

/**
 * Hook untuk memuat katalog paket langganan
 */
export function useAdminPackages() {
  return useQuery<PaketLanggananItem[], Error>({
    queryKey: queryKeys.admin.paket,
    queryFn: () => adminService.getPackages(),
    staleTime: 60 * 1000,
  });
}

/**
 * Mutasi untuk membuat paket langganan baru
 */
export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation<PaketLanggananItem, Error, CreatePackagePayload>({
    mutationFn: (payload) => adminService.createPackage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] === 'paket',
      });
    },
  });
}

/**
 * Mutasi untuk mengedit paket langganan
 */
export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation<PaketLanggananItem, Error, { id: string | number; payload: UpdatePackagePayload }>({
    mutationFn: ({ id, payload }) => adminService.updatePackage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] === 'paket',
      });
    },
  });
}

/**
 * Mutasi untuk menghapus paket langganan
 */
export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string | number>({
    mutationFn: (id) => adminService.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] === 'paket',
      });
    },
  });
}

/**
 * Mutasi untuk toggle status paket langganan
 */
export function useTogglePackageStatus() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string | number; statusAktif: boolean }>({
    mutationFn: ({ id, statusAktif }) => adminService.togglePackageStatus(id, statusAktif),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] === 'paket',
      });
    },
  });
}

/**
 * Hook untuk memuat daftar kebun tenant dalam mode inspeksi
 */
export function useTenantFarms(tenantId: string) {
  return useQuery<KebunBackend[], Error>({
    queryKey: queryKeys.admin.inspection.farms(tenantId),
    queryFn: () => adminService.getTenantFarms(tenantId),
    enabled: Boolean(tenantId),
    retry: (failureCount, error) => {
      // Jangan retry jika 403 Forbidden (izin akses ditolak)
      const isForbidden =
        error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 403;
      if (isForbidden) return false;
      return failureCount < 2;
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Hook untuk memuat daftar blok kebun tenant dalam mode inspeksi
 */
export function useTenantBlocks(tenantId: string, kebunId: string) {
  return useQuery<BlokBackend[], Error>({
    queryKey: queryKeys.admin.inspection.blocks(tenantId, kebunId),
    queryFn: () => adminService.getTenantBlocks(tenantId, kebunId),
    enabled: Boolean(tenantId && kebunId),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook untuk memuat daftar node sensor kebun tenant dalam mode inspeksi
 */
export function useTenantNodes(tenantId: string, kebunId: string) {
  return useQuery<NodeSensorBackend[], Error>({
    queryKey: queryKeys.admin.inspection.nodes(tenantId, kebunId),
    queryFn: () => adminService.getTenantNodes(tenantId, kebunId),
    enabled: Boolean(tenantId && kebunId),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook untuk memuat status lampu dan heartbeat blok tenant
 */
export function useTenantLampStatus(tenantId: string, blokId: string | number) {
  return useQuery<StatusLampuBlok, Error>({
    queryKey: queryKeys.admin.inspection.lampStatus(tenantId, blokId),
    queryFn: () => adminService.getTenantLampStatus(tenantId, blokId),
    enabled: Boolean(tenantId && blokId),
    staleTime: 15 * 1000,
  });
}

/**
 * Hook untuk memuat daftar gateway tenant
 */
export function useTenantGateways(tenantId: string, kebunId?: string) {
  return useQuery<GatewayInspectionItem[], Error>({
    queryKey: queryKeys.admin.inspection.gateways(tenantId, kebunId),
    queryFn: () => adminService.getTenantGateways(tenantId, kebunId),
    enabled: Boolean(tenantId),
    staleTime: 30 * 1000,
  });
}
