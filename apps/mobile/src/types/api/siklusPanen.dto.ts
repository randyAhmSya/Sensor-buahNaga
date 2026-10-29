export interface BackendSiklusPanenDTO {
  id_siklus_panen: string;
  block_id: string;
  tanggal_penyinaran: string;
  estimasi_tanggal_panen?: string | null;
  status_siklus: "BERJALAN" | "SELESAI" | "DIBATALKAN" | string;
  blok?: {
    id_blok: string;
    nama_blok: string;
    kebun?: {
      id_kebun: string;
      nama_kebun: string;
    };
  };
}