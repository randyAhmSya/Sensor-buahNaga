/**
 * Definisi Tipe Kode QR Backend Laravel AgroLight
 */

export interface KodeQrBackend {
  id_qr: string;
  id?: string;
  teks_kode_qr: string;
  status_qr: boolean | number;
  created_at?: string;
  updated_at?: string;
  node_sensor?: {
    id_sensor: string;
    id?: string;
    kode_perangkat: string;
    tipe_sensor?: string;
    status_koneksi?: string;
    blok?: {
      id_blok: string;
      id?: string;
      nama_blok: string;
      kebun?: {
        id_kebun?: string;
        id?: string;
        nama_kebun?: string;
      };
    };
  } | null;
  blok?: {
    id_blok: string;
    id?: string;
    nama_blok: string;
    kebun?: {
      id_kebun?: string;
      id?: string;
      nama_kebun?: string;
    };
  } | null;
}

export interface CreateQrPayload {
  teks_kode_qr?: string;
  kode_unik?: string;
  blok_id?: string;
  kebun_id?: string;
  status_qr?: boolean | number;
}

export interface UpdateQrPayload {
  teks_kode_qr?: string;
  status_qr?: boolean | number;
}

export interface QRCodeItem {
  id: string;
  codeText: string;
  qrImageUrl: string;
  farmName: string;
  blockName: string;
  status: 'Aktif' | 'Nonaktif';
  pairingStatus: 'Sudah Terhubung' | 'Belum Terhubung';
  createdAt: string;
}

