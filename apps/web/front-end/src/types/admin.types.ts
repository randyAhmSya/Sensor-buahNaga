/**
 * Tipe Data Spesifikasi Web Portal Super Admin AgroLight
 * Sesuai Dokumen Resmi Frontend Integration Guide & API Contract
 */

export interface AdminPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface AdminApiResponse<T> {
  status: 'succes' | 'success' | string;
  pesan: string | null;
  data: T;
  meta?: AdminPaginationMeta;
}

export interface AdminDashboardSummary {
  tenant?: {
    total: number;
    aktif: number;
    nonaktif: number;
  };
  user?: {
    total: number;
    aktif: number;
    nonaktif: number;
    per_role?: {
      superAdmin?: number;
      petani?: number;
      [key: string]: number | undefined;
    };
  };
  pengguna?: {
    total: number;
    petani_biasa: number;
    super_admin: number;
  };
  langganan?: {
    total: number;
    aktif: number;
    tenggang: number;
    kadaluarsa: number;
  };
  transaksi?: {
    total: number;
    menunggu_pembayaran: number;
    diverifikasi: number;
    ditolak: number;
    pendapatan_total: number;
  };
  transaksi_keuangan?: {
    total_transaksi: number;
    menunggu_pembayaran: number;
    diverifikasi: number;
    ditolak: number;
    total_pendapatan: number;
  };
  infrastruktur?: {
    kebun?: {
      total: number;
      aktif?: number;
      nonaktif?: number;
    };
    blok?: {
      total: number;
    };
    gateway?: {
      total?: number;
      per_status?: {
        online?: number;
        offline?: number;
        [key: string]: number | undefined;
      };
      online?: number;
      offline?: number;
    };
    node_sensor?: {
      total?: number;
      per_status?: {
        aktif?: number;
        nonaktif?: number;
        mati?: number;
        [key: string]: number | undefined;
      };
      per_tipe?: Record<string, number>;
      aktif?: number;
      mati?: number;
    };
    total_kebun?: number;
    total_blok?: number;
  };
  aktivitas_terbaru?: AdminAuditLogItem[];
}

export interface AdminTenantItem {
  id?: string | number;
  tenant_id?: string | number;
  nama_tenant: string;
  email?: string;
  status?: 'aktif' | 'nonaktif' | boolean | string;
  is_aktif?: boolean;
  paket_langganan?: string;
  status_langganan?: string;
  sisa_hari?: number;
  jumlah_kebun?: number;
  jumlah_user?: number;
  created_at?: string;
  terdaftar_pada?: string;
}

export type TransactionStatus =
  | 'menunggu_verifikasi'
  | 'berhasil'
  | 'diverifikasi'
  | 'ditolak'
  | 'menunggu_pembayaran';

export interface AdminTransactionTenantRelation {
  tenant_id?: string | number;
  nama_tenant?: string;
  nama?: string;
  email?: string;
}

export interface AdminTransactionItem {
  id: string | number;
  id_transaksi?: string;
  nama_tenant: string;
  nama_paket: string;
  tambahan_hari: number;
  harga: number;
  metode_pembayaran: string;
  tanggal_pengajuan: string;
  created_at?: string;
  status: TransactionStatus;
  status_pembayaran?: TransactionStatus;
  alasan_penolakan?: string | null;
  bukti_transfer_url?: string;
  tenant?: AdminTransactionTenantRelation;
}

export interface AdminAuditLogAdminRelation {
  id?: string | number;
  nama_lengkap?: string;
  email?: string;
}

export interface AdminAuditLogItem {
  id?: string | number;
  id_log?: string | number;
  waktu?: string;
  created_at?: string;
  updated_at?: string;
  nama_admin?: string;
  admin?: string | AdminAuditLogAdminRelation | null;
  admin_id?: string;
  aksi: string;
  target_tipe: string;
  target_id: string | number;
  keterangan?: string | null;
}

export function resolveAdminName(log: AdminAuditLogItem): string {
  if (typeof log.admin === 'string' && log.admin.trim() !== '') {
    return log.admin;
  }
  if (typeof log.admin === 'object' && log.admin !== null) {
    return log.admin.nama_lengkap || log.admin.email || 'Super Admin';
  }
  return log.nama_admin || 'Super Admin';
}

export interface PaginatedListResult<T> {
  data: T[];
  meta: AdminPaginationMeta;
}

export type AdminUserRole = 'petani_biasa' | 'superAdmin';

export interface AdminUserItem {
  id: string | number;
  nama_lengkap: string;
  email: string;
  role: AdminUserRole | string;
  tenant_id?: string | number | null;
  nama_tenant?: string | null;
  tenant?: {
    tenant_id?: string | number;
    nama_tenant?: string;
  } | null;
  is_aktif: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  nama_lengkap: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'petani_biasa' | 'superAdmin';
  tenant_id?: string | null;
}

export interface UpdateUserPayload {
  nama_lengkap?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: 'petani_biasa' | 'superAdmin';
  tenant_id?: string | null;
  is_aktif?: boolean;
}

export interface UserFilterParams {
  page?: number;
  per_page?: number;
  role?: string;
  search?: string;
  is_aktif?: boolean | string;
}

export interface PaketLanggananItem {
  id?: string | number;
  id_paket: string | number;
  nama_paket: string;
  tambahan_hari: number;
  harga: number;
  status_aktif: boolean;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePackagePayload {
  nama_paket: string;
  tambahan_hari: number;
  harga: number;
  status_aktif: boolean;
  keterangan?: string;
}

export interface UpdatePackagePayload {
  nama_paket?: string;
  tambahan_hari?: number;
  harga?: number;
  status_aktif?: boolean;
  keterangan?: string;
}

export interface GatewayInspectionItem {
  id_gateway: string;
  kebun_id?: string;
  kode_perangkat: string;
  status_koneksi: 'terhubung' | 'terputus' | string;
  terakhir_terlihat?: string | null;
}

export interface StatusLampuBlok {
  id_blok: string | number;
  status_lampu: 'aktif' | 'mati' | 'menyala' | 'on' | string;
  intensitas?: number;
  mode?: string | null;
  jadwal_aktif?: string | null;
  heartbeat_terakhir?: string | null;
  terakhir_aktif?: string | null;
}

