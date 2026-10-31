/**
 * Strict TypeScript types untuk endpoint ringkasan node tunggal:
 * GET /api/petani/node/{id_sensor}/ringkasan
 */

export type NodeRingkasanStatus = "online" | "offline" | "belum_pernah_terlihat";

export interface NodeRingkasanBlok {
  id_blok: string;
  nama_blok: string;
  luas_area: number | null;
}

export interface NodeRingkasanKebun {
  id_kebun: string;
  nama_kebun: string;
}

export interface NodeRingkasanGateway {
  id_gateway: string;
  kode_perangkat: string;
}

export interface NodeRingkasanNodeInfo {
  id_sensor: string;
  kode_perangkat: string;
  tipe_sensor: string;
  status: NodeRingkasanStatus;
  status_online: boolean;
  terakhir_terlihat: string | null; // ISO string atau null
  blok: NodeRingkasanBlok;
  kebun: NodeRingkasanKebun;
  gateway: NodeRingkasanGateway | null;
  kode_qr: string | { kode_qr?: string } | null;
}

export interface NodeRingkasanBacaan {
  nilai_lux: number;
  suhu: number | null;
  dicatat_pada: string; // ISO string
  basi: boolean;
}

export interface NodeRingkasanEnergi {
  watt_terakhir: number | null;
  dicatat_pada: string | null;
  basi: boolean;
  kwh_24_jam: number;
}

export interface NodeRingkasanDimming {
  kecerahan_persen: number;
  nilai_lux: number;
  fase_bulan: string | null;
  dicatat_pada: string;
  basi: boolean;
}

export type NodeRingkasanJadwalSumber = "override" | "default" | "belum_ada";

export interface NodeRingkasanJadwalDetail {
  mode: "auto" | "manual";
  jam_mulai_nyala: string; // "18:00:00"
  jam_akhir_nyala: string; // "05:00:00"
  target_lux?: number | null;
  intensitas_minimum?: number | null;
  instensitas_cahaya?: number | null;
  baseline_manual_persen?: number | null;
}

export interface NodeRingkasanJadwal {
  sumber: NodeRingkasanJadwalSumber;
  sedang_dalam_jendela_nyala: boolean;
  jadwal: NodeRingkasanJadwalDetail | null;
}

export interface BackendNodeRingkasanDTO {
  node: NodeRingkasanNodeInfo;
  bacaan_terakhir: NodeRingkasanBacaan | null;
  energi: NodeRingkasanEnergi;
  dimming_terakhir: NodeRingkasanDimming | null;
  jadwal: NodeRingkasanJadwal;
  batas_offline_detik: number;
}

