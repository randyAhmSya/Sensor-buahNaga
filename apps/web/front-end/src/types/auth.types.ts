/**
 * Definisi Tipe Autentikasi dan Pengguna Backend Laravel AgroLight
 */

export type BackendRole = 'superAdmin' | 'petani_biasa';

export interface BackendUser {
  id: string;
  tenant_id: string;
  nama_lengkap: string;
  email: string;
  role: BackendRole;
  nomor_telepon?: string | null;
  url_foto?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: BackendUser;
  role: BackendRole;
  token: string;
}

export interface RegisterPayload {
  nama_tenant: string;
  nama_lengkap: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponseData {
  user: BackendUser;
  token: string;
}
