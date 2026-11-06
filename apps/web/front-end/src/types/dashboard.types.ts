/**
 * Definisi Tipe Data Dashboard Petani
 * Sesuai kontrak backend GET /api/petani/dashboard?kebun_id={id}
 */

export type NodeSensorDashboardStatus = 'online' | 'offline' | 'belum_pernah_terlihat';

export interface PetaniDashboardKebun {
  id_kebun: string;
  nama_kebun: string;
  lokasi_kebun: string;
  status_kebun: string | boolean;
}

export interface PetaniDashboardRingkasan {
  jumlah_blok: number;
  jumlah_node: number;
  node_online: number;
  node_offline: number;
  node_belum_terlihat: number;
  jumlah_lampu?: number;
  lampu_online?: number;
  lampu_offline?: number;
  watt_terpasang?: number | null;
  siklus_berjalan: number;
  batas_offline_detik: number;
}

export interface PetaniDashboardJadwalItem {
  id_jadwal_lampu: string;
  kebun_id?: string;
  sensor_id?: string | null;
  jam_mulai_nyala?: string;
  jam_akhir_nyala?: string;
  mode?: 'auto' | 'manual' | string;
  instensitas_cahaya?: number;
  baseline_manual_persen?: number | null;
  target_lux?: number;
  intensitas_minimum?: number;
  status_aktif?: boolean;
  keterangan?: string | null;
}

export interface PetaniDashboardNode {
  id_sensor: string;
  kode_perangkat: string;
  status: NodeSensorDashboardStatus;
  status_online: boolean;
  terakhir_terlihat: string | null;
  jumlah_lampu?: number;
  watt_per_lampu?: number | null;
  watt_terpasang?: number | null;
}

export interface PetaniDashboardSiklusAktif {
  id_siklus_panen: string;
  status_siklus: string;
  tanggal_penyinaran: string;
  target_hari_berbunga: number;
  tanggal_berbunga_aktual: string | null;
  target_hari_panen_setelah_bunga: number;
  estimasi_tanggal_panen: string;
}

export interface PetaniDashboardJadwalBlok {
  sumber: 'override' | 'default' | 'tanpa_node' | 'belum_ada';
  jadwal: PetaniDashboardJadwalItem | null;
}

export interface PetaniDashboardBlok {
  id_blok: string;
  nama_blok: string;
  luas_area: number;
  url_foto: string | null;
  jumlah_node: number;
  jumlah_lampu?: number;
  node: PetaniDashboardNode[];
  siklus_aktif: PetaniDashboardSiklusAktif | null;
  jadwal: PetaniDashboardJadwalBlok;
}

export interface PetaniDashboardData {
  kebun: PetaniDashboardKebun;
  ringkasan: PetaniDashboardRingkasan;
  jadwal_default_kebun: PetaniDashboardJadwalItem | null;
  blok: PetaniDashboardBlok[];
}

