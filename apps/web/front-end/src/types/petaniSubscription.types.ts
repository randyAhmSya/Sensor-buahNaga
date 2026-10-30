export interface PaketLanggananItem {
  id_paket: string;
  nama_paket: string;
  harga: number;
  tambahan_hari: number;
  deskripsi?: string | null;
  status_aktif: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionStatusType = 'aktif' | 'trial' | 'tenggang' | 'kadaluarsa';

export interface StatusLanggananPetani {
  status_langganan: SubscriptionStatusType;
  sisa_hari: number;
  dalam_masa_tenggang: boolean;
}

export type PetaniPaymentStatus =
  | 'menunggu_verifikasi'
  | 'menunggu_pembayaran'
  | 'berhasil'
  | 'diverifikasi'
  | 'ditolak';

export interface TransaksiPetaniItem {
  id_transaksi?: string;
  id?: string;
  tenant_id: string;
  paket_langganan_id: string;
  nama_paket: string;
  tambahan_hari: number;
  harga: number;
  metode_pembayaran: string;
  status_pembayaran: PetaniPaymentStatus;
  bukti_transfer?: string | null;
  alasan_penolakan?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AjukanPembelianPayload {
  paket_langganan_id: string;
  bukti_transfer: File;
}

export interface BeliOnlinePayload {
  paket_langganan_id: string;
}

export interface BeliOnlineResponse {
  id_transaksi: string;
  snap_token: string;
}

