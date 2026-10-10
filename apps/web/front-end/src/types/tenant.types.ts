/**
 * Definisi Tipe Tenant Backend Laravel AgroLight
 */

export interface TenantBackend {
  tenant_id: string;
  nama_tenant: string;
  paket_langganan: string;
  is_admin_allowed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ToggleAdminAccessPayload {
  is_admin_allowed: boolean;
}

export interface TenantAccessStatusResponse {
  is_admin_allowed: boolean;
}
