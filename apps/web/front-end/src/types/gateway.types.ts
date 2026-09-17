/**
 * Definisi Tipe Gateway IoT Backend Laravel AgroLight
 */

export type GatewayStatus = 'terhubung' | 'belum_terhubung' | string;

export interface GatewayBackend {
  id_gateway: string;
  id?: string;
  blok_id: string;
  kode_perangkat: string;
  status_koneksi: GatewayStatus;
  kode_pairing?: string | null;
  token_gateway?: string | null;
  terakhir_terlihat?: string | null;
  created_at?: string;
  updated_at?: string;
  blok?: {
    id_blok?: string;
    id?: string;
    nama_blok: string;
    kebun_id?: string;
    kebun?: {
      id_kebun?: string;
      nama_kebun?: string;
    };
  };
}

export interface CreateGatewayPayload {
  blok_id: string;
  kode_perangkat: string;
  status_koneksi: GatewayStatus;
}

export interface UpdateGatewayPayload {
  nama_gateway?: string;
  mac_address?: string;
  status?: string;
}
