/**
 * Definisi Tipe Node Sensor IoT Backend Laravel AgroLight
 */

export type NodeSensorStatus = 'aktif' | 'nonaktif' | string;

export interface NodeSensorBackend {
  id_sensor: string;
  id?: string;
  blok_id: string | null;
  gateway_id: string | null;
  qr_id: string | null;
  kode_perangkat: string;
  kode_pairing?: string | null;
  token_perangkat?: string | null;
  tipe_sensor: string;
  status_koneksi: NodeSensorStatus;
  terakhir_terlihat: string | null;
  created_at?: string;
  updated_at?: string;
  blok?: {
    id_blok: string;
    id?: string;
    nama_blok: string;
    kebun_id?: string;
    kebun?: {
      id_kebun?: string;
      id?: string;
      nama_kebun?: string;
    };
  } | null;
  gateway?: {
    id_gateway: string;
    id?: string;
    kode_perangkat: string;
    status_koneksi: string;
  } | null;
  qr?: {
    id_qr: string;
    id?: string;
    teks_kode_qr: string;
    status_qr: boolean | number;
  } | null;
}

export interface CreateNodePayload {
  kode_perangkat: string;
  blok_id?: string | null;
  gateway_id?: string | null;
  qr_id?: string | null;
  kode_pairing?: string;
  token_perangkat?: string;
  tipe_sensor?: string;
  status_koneksi?: NodeSensorStatus;
}

export interface UpdateNodePayload {
  kode_perangkat?: string;
  blok_id?: string | null;
  gateway_id?: string | null;
  tipe_sensor?: string;
  status_koneksi?: string;
}
