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
  nodeSensorName?: string;
  isAssignedToNode?: boolean;
}

export interface ScanQrPayload {
  teks_kode_qr: string;
  platform?: string;
  latitude?: number;
  longitude?: number;
}

export interface QrScanLogItem {
  id_log?: string;
  id?: string;
  user_id?: string;
  qr_id?: string;
  dicatat_pada: string;
  created_at?: string;
  platform?: string | null;
  status_scan?: string | boolean;
  kode_qr?: {
    id_qr: string;
    teks_kode_qr: string;
    status_qr: boolean;
    node_sensor?: {
      id_sensor: string;
      kode_perangkat: string;
      blok?: {
        id_blok: string;
        nama_blok: string;
      };
    } | null;
  } | null;
}

