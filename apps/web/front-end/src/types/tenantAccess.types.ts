/**
 * Tipe Data Fitur Minta & Kelola Izin Akses Tenant
 * Sesuai API Contract Backend Laravel AgroLight Modul 3
 */

export type TenantAccessStatus = 'pending' | 'disetujui' | 'ditolak' | 'dicabut';

export interface AdminTenantAccessItem {
  id_akses: string;
  id?: string;
  tenant_id: string;
  admin_id: string;
  status: TenantAccessStatus;
  alasan_permintaan?: string | null;
  alasan?: string | null;
  alasan_penolakan?: string | null;
  diminta_pada: string;
  diputuskan_pada?: string | null;
  diputuskan_oleh?: string | null;
  tenant?: {
    id_tenant: string;
    id?: string;
    nama_tenant: string;
    email?: string;
    status_langganan?: string;
    kuota_sensor?: number;
  } | null;
  admin?: {
    id_admin: string;
    id?: string;
    nama: string;
    email?: string;
  } | null;
}

export interface PetaniTenantAccessItem {
  id_akses: string;
  id?: string;
  tenant_id: string;
  admin_id: string;
  status: TenantAccessStatus;
  alasan_permintaan?: string | null;
  alasan?: string | null;
  alasan_penolakan?: string | null;
  diminta_pada: string;
  diputuskan_pada?: string | null;
  diputuskan_oleh?: string | null;
  admin?: {
    id_admin: string;
    id?: string;
    nama: string;
    email?: string;
  } | null;
  tenant?: {
    id_tenant: string;
    id?: string;
    nama_tenant: string;
  } | null;
}

export interface RequestTenantAccessPayload {
  alasan?: string;
}

export interface RejectTenantAccessPayload {
  alasan?: string;
}
