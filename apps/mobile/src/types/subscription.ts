export interface PaketLangganan {
  id_paket: string;
  nama_paket: string;
  harga: number;
  tambahan_hari: number;
  status_aktif: boolean;
  deskripsi?: string | null;
}

export type StatusLanggananType = "aktif" | "dalam_masa_tenggang" | "kadaluarsa";

export interface StatusLangganan {
  status_langganan: StatusLanggananType;
  sisa_hari: number;
  dalam_masa_tenggang: boolean;
}

export type StatusPembayaran =
  | "menunggu_pembayaran"
  | "menunggu_verifikasi"
  | "berhasil"
  | "diverifikasi"
  | "ditolak"
  | "dibatalkan";

export interface TransaksiLangganan {
  id_transaksi: string;
  tenant_id: string;
  paket_langganan_id: string;
  nama_paket: string;
  tambahan_hari: number;
  harga: number;
  status_pembayaran: StatusPembayaran | string;
  metode_pembayaran: "transfer_manual" | "midtrans" | string;
  bukti_transfer?: string | null;
  alasan_penolakan?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SnapOnlineResponse {
  id_transaksi: string;
  snap_token: string;
}

export interface PaginationMeta {
  current_page: number;
  from?: number;
  last_page: number;
  per_page: number;
  to?: number;
  total: number;
}
