export type LampMode = "auto" | "manual";

/**
 * Representasi data jadwal lampu aktif dari backend Laravel.
 * Endpoint: GET /api/petani/jadwal-lampu/aktif?sensor_id={sensor_id}
 */
export interface JadwalLampuAktif {
  id_jadwal_lampu: string;
  kebun_id: string | null;
  sensor_id: string | null;
  jam_mulai_nyala: string;
  jam_akhir_nyala: string;
  mode: LampMode;
  instensitas_cahaya: number | null;
  baseline_manual_persen: number | null;
  target_lux: number | null;
  intensitas_minimum: number | null;
  status_aktif: boolean;
  keterangan: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Format respon standar backend Laravel untuk modul jadwal lampu.
 * Catatan: Status bertuliskan 'succes' (huruf s satu di akhir) sesuai kontrak backend.
 */
export interface JadwalLampuResponse<T = JadwalLampuAktif> {
  status: "succes" | "error";
  pesan: string;
  data: T;
}

/**
 * Payload Kasus A: Update jadwal yang sudah spesifik milik sensor/blok ini.
 * Endpoint: PUT /api/petani/jadwal-lampu/{id_jadwal_lampu}
 */
export interface UpdateJadwalManualPayload {
  mode: "manual";
  instensitas_cahaya: number;
}

/**
 * Payload Kasus B: Buat jadwal baru khusus sensor/blok ini (override jadwal kebun).
 * Endpoint: POST /api/petani/jadwal-lampu
 */
export interface CreateJadwalOverridePayload {
  sensor_id: string;
  jam_mulai_nyala: string; // Format HH:mm (tanpa detik)
  jam_akhir_nyala: string; // Format HH:mm (tanpa detik)
  mode: "manual";
  instensitas_cahaya: number;
}

/**
 * Informasi error terstruktur hasil parsing error respons jadwal lampu.
 */
export interface JadwalErrorDetails {
  message: string;
  status?: number;
  retryAfterSeconds?: number;
}
