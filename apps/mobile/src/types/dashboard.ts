/**
 * Strict TypeScript types untuk endpoint agregasi dashboard:
 * GET /api/petani/dashboard?kebun_id={id}
 */

export type NodeStatusType = "online" | "offline" | "belum_pernah_terlihat";

export interface DashboardBacaanTerakhir {
  nilai_lux: number;
  suhu: number | null;
  dicatat_pada: string; // ISO string
  basi: boolean;
  id_sensor?: string;
  kode_perangkat?: string;
}

export interface DashboardNodeItem {
  id_sensor: string;
  kode_perangkat: string;
  status: NodeStatusType;
  status_online: boolean;
  terakhir_terlihat: string | null; // ISO string
  bacaan_terakhir?: DashboardBacaanTerakhir | null;
}

export interface DashboardSiklusAktif {
  id_siklus_panen: string;
  status_siklus: string;
  tanggal_penyinaran: string;
  target_hari_berbunga: number | null;
  tanggal_berbunga_aktual: string | null;
  target_hari_panen_setelah_bunga: number | null;
  estimasi_tanggal_panen: string | null;
}

export type JadwalSumber = "override" | "default" | "belum_ada" | "tanpa_node";

export interface DashboardJadwalData {
  id_jadwal_lampu?: string;
  kebun_id?: string;
  sensor_id?: string;
  mode?: "manual" | "otomatis" | "semi_otomatis";
  jam_mulai_nyala?: string;
  jam_akhir_nyala?: string;
  instensitas_cahaya?: number | null;
  target_lux?: number | null;
  intensitas_minimum?: number | null;
  status_aktif?: boolean;
}

export interface DashboardJadwalItem {
  sumber: JadwalSumber;
  jadwal: DashboardJadwalData | null;
}

export interface DashboardBlokItem {
  id_blok: string;
  nama_blok: string;
  luas_area: string | number | null;
  url_foto: string | null;
  jumlah_node: number;
  node: DashboardNodeItem[];
  siklus_aktif: DashboardSiklusAktif | null;
  jadwal: DashboardJadwalItem;
}

export interface DashboardRingkasan {
  jumlah_blok: number;
  jumlah_node: number;
  node_online: number;
  node_offline: number;
  node_belum_terlihat: number;
  siklus_berjalan: number;
  batas_offline_detik: number;
  bacaan_terbaru: DashboardBacaanTerakhir | null;
}

export interface DashboardKebunItem {
  id_kebun: string;
  nama_kebun: string;
  lokasi_kebun: string | null;
  status_kebun: string | null;
}

export interface BackendDashboardData {
  kebun: DashboardKebunItem;
  ringkasan: DashboardRingkasan;
  jadwal_default_kebun: DashboardJadwalData | null;
  blok: DashboardBlokItem[];
}
