export interface NotifikasiItem {
  id_notifikasi: string;
  tenant_id: string;
  tipe: 'info' | 'peringatan' | 'panen' | 'perangkat' | 'langganan' | string;
  judul: string;
  pesan: string;
  data?: Record<string, unknown> | null;
  sudah_dibaca: boolean;
  dibaca_pada: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface NotifikasiListResponse {
  status?: string;
  success?: boolean;
  message?: string | null;
  data: NotifikasiItem[];
  meta?: PaginationMeta;
}

export interface TandaiSemuaDibacaResponse {
  status?: string;
  success?: boolean;
  data: {
    jumlah_ditandai: number;
  };
}

export interface BlokStatusLampuDTO {
  jumlah_lampu: number;
  jumlah_online: number;
  jumlah_offline: number;
  batas_offline_detik: number;
  nodes: Array<{
    id_sensor: string;
    kode_perangkat: string;
    status_online: boolean;
    terakhir_terlihat: string | null;
  }>;
}

export interface BlokLampuSummary {
  idBlok: string;
  namaBlok: string;
  namaKebun: string;
  jumlahLampu: number;
  jumlahOnline: number;
  jumlahOffline: number;
  batasOfflineDetik: number;
  persentaseOnline: number;
  statusKoneksi: 'optimal' | 'sebagian_offline' | 'semua_offline' | 'kosong';
}