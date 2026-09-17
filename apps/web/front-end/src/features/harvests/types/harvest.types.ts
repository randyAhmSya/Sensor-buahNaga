/**
 * Model Data Siklus Panen Sesuai Kontrak Resmi Backend AgroLight:
 * Identifier: id_siklus_panen (UUID)
 * Endpoint:
 * - POST   /api/petani/siklus-panen
 * - GET    /api/petani/siklus-panen?blok_id=UUID-BLOK
 * - GET    /api/petani/siklus-panen/{id_siklus_panen}
 * - PUT    /api/petani/siklus-panen/{id_siklus_panen}
 * - DELETE /api/petani/siklus-panen/{id_siklus_panen}
 */

export type HarvestCycleStatus = 'BERJALAN' | 'SELESAI';

export interface HarvestCycle {
  id_siklus_panen: string;
  block_id: string;
  tanggal_penyinaran: string; // YYYY-MM-DD
  target_hari_berbunga: number;
  target_hari_panen_setelah_bunga?: number;
  estimasi_tanggal_panen: string; // YYYY-MM-DD
  tanggal_berbunga_aktual?: string | null; // YYYY-MM-DD
  tanggal_panen?: string | null; // YYYY-MM-DD
  status_siklus: HarvestCycleStatus;

  // Metadata relasi untuk kemudahan presentasi antarmuka
  blockName?: string;
  farmName?: string;
  blok?: {
    id_blok?: string;
    nama_blok?: string;
    kebun?: {
      id_kebun?: string;
      nama_kebun?: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

/** Payload untuk memulai siklus panen baru (POST /api/petani/siklus-panen) */
export interface StartHarvestCyclePayload {
  block_id: string;
  tanggal_penyinaran: string; // YYYY-MM-DD
  target_hari_berbunga: number; // default: 20
}

/** Payload Opsi A: Catat Bunga Aktual (PUT /api/petani/siklus-panen/{id}) */
export interface RecordFlowerPayload {
  tanggal_berbunga_aktual: string; // YYYY-MM-DD
}

/** Payload Opsi B: Catat Panen / Selesaikan Siklus (PUT /api/petani/siklus-panen/{id}) */
export interface RecordHarvestPayload {
  tanggal_panen: string; // YYYY-MM-DD
}

export type UpdateHarvestActualPayload = RecordFlowerPayload | RecordHarvestPayload;

/** Metrik ringkasan siklus panen pada kartu dashboard / header modul */
export interface HarvestMetrics {
  activeCycles: number;
  nearestHarvestDate: string;
  completedCycles: number;
  totalHarvestThisMonthTon?: number;
}

/** Tipe kompatibilitas lama jika masih ada referensi komponen sebelumnya */
export type HarvestCycleItem = HarvestCycle;
