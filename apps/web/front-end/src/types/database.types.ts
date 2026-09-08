/**
 * Database Entity Types
 * Sesuai dengan skema database relasional PostgreSQL / Laravel backend AgroLight.
 * Penamaan properti kolom menggunakan snake_case persis mengikuti skema tabel.
 */

// ==========================================
// 1. Tenants & Users
// ==========================================
export interface Tenant {
  tenant_id: string
  nama_tenant: string
  paket_langganan?: string
  status_aktif?: boolean
  alamat?: string
  kontak?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number | string
  tenant_id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN_KEBUN' | 'PETANI' | 'AGRONOM'
  avatar_url?: string
  nomor_telepon?: string
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

// ==========================================
// 2. Hierarki Lahan
// ==========================================
export interface Kebun {
  id_kebun: string
  tenant_id: string
  nama_kebun: string
  lokasi: string
  latitude?: number
  longitude?: number
  luas_hektar?: number
  nama_pengelola?: string
  created_at?: string
  updated_at?: string
}

export interface Blok {
  id_blok: string
  kebun_id: string
  nama_blok: string
  luas_area: number // dalam hektar atau m2
  varietas_naga?: string
  jumlah_tiang?: number
  created_at?: string
  updated_at?: string
}

// ==========================================
// 3. IoT & Telemetri
// ==========================================
export interface Gateway {
  id_gateway: string
  blok_id: string
  kode_gateway: string
  nama_gateway?: string
  status_koneksi: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  ip_address?: string
  mac_address?: string
  frekuensi_mhz?: number
  last_ping?: string
  created_at?: string
  updated_at?: string
}

export interface NodeSensor {
  id_sensor: string
  blok_id: string
  gateway_id?: string | null
  qr_id?: string | null
  kode_perangkat: string
  nama_perangkat: string
  tipe_sensor: string // misal: 'Photosynthetic Light Node', 'FDR Soil Moisture & Temp'
  status_koneksi: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  uptime?: string
  last_ping?: string
  created_at?: string
  updated_at?: string
}

export interface ReadSensor {
  id_bacaan?: number | string
  sensor_id: string
  nilai_lux: number
  suhu: number
  kelembapan_udara?: number
  kelembapan_tanah?: number
  waktu_baca: string
  created_at?: string
}

export interface LogEnergy {
  id_log_energi?: number | string
  sensor_id?: string | null
  gateway_id?: string | null
  konsumsi_watt: number
  tegangan_volt: number
  arus_ampere?: number
  persentase_baterai?: number
  tegangan_solar?: number
  waktu_catat: string
  created_at?: string
}

export interface LogPeredupan {
  id_log_peredupan?: number | string
  blok_id: string
  gateway_id?: string | null
  presentase_redup: number // 0 - 100%
  fase_bulan: string // misal: 'Bulan Purnama', 'Kuartal Awal', dll
  alasan_redup?: string
  waktu_catat: string
  created_at?: string
}

// ==========================================
// 4. Agrikultur & Siklus Panen
// ==========================================
export interface SiklusPanen {
  id_siklus_panen: string
  block_id: string
  target_hari_berbunga: number
  estimasi_tanggal_panen: string
  status_siklus: 'Fase Vegetatif' | 'Induksi Pembungaan' | 'Muncul Tunas' | 'Pembesaran Buah' | 'Pematangan' | 'Selesai Panen'
  akumulasi_lux_jam: number
  target_lux_jam: number
  progres_persen?: number
  status_pencahayaan?: string
  target_brix?: number
  tanggal_mulai?: string
  created_at?: string
  updated_at?: string
}

// ==========================================
// 5. Manajemen Aset & Kode QR
// ==========================================
export interface KodeQr {
  id_qr: string
  teks_kode_qr: string
  status_qr: 'TERCETAK' | 'MENUNGGU_CETAK' | 'GAGAL' | 'RUSAK'
  tipe_target?: 'Sensor' | 'Blok'
  target_id?: string
  nama_target?: string
  blok_id?: string
  tanggal_generate: string
  teknisi_pembuat?: string
  catatan?: string
  created_at?: string
  updated_at?: string
}

// ==========================================
// 6. View Models / Joined API Responses
// ==========================================

export interface SensorAnomaly {
  id_anomali: string
  waktu: string
  tingkat_keparahan: 'LOW' | 'WARNING' | 'CRITICAL'
  deskripsi: string
}

/**
 * Gabungan node_sensors + read__sensors + log_energies untuk monitoring kesehatan alat
 */
export interface NodeSensorHealthDTO {
  id_sensor: string
  blok_id: string
  gateway_id?: string | null
  qr_id?: string | null
  kode_perangkat: string
  nama_perangkat: string
  tipe_sensor: string
  lokasi_kebun: string
  status_koneksi: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  uptime: string
  last_ping: string
  nilai_lux: number
  suhu: number
  konsumsi_watt: number
  tegangan_volt: number
  tegangan_solar?: number
  persentase_baterai?: number
  sinyal_rssi?: number
  anomali: SensorAnomaly[]
}

/**
 * Gabungan bloks + siklus_panens untuk visualisasi akumulasi lux dan estimasi panen
 */
export interface BlokHarvestDTO {
  id_blok: string
  kebun_id: string
  nama_blok: string
  luas_area: number
  varietas_naga: string
  jumlah_tiang: number
  id_siklus_panen: string
  status_siklus: string
  target_hari_berbunga: number
  estimasi_tanggal_panen: string
  akumulasi_lux_jam: number
  target_lux_jam: number
  progres_persen: number
  status_pencahayaan: string
  target_brix?: number
}

/**
 * Gabungan kode_qrs + relasi target
 */
export interface KodeQrDTO {
  id_qr: string
  teks_kode_qr: string
  status_qr: 'TERCETAK' | 'MENUNGGU_CETAK' | 'GAGAL' | 'RUSAK'
  tipe_target: 'Sensor' | 'Blok'
  id_target: string
  terhubung_ke: string
  blok_id: string
  tanggal_generate: string
  teknisi_pembuat?: string
  catatan?: string
}

/**
 * Hierarki B2B Tenant, Kebun, dan Blok
 */
export interface TenantHierarchyDTO {
  tenant_id: string
  nama_tenant: string
  merek_dagang: string
  paket_langganan: string
  siklus_tagihan: string
  kantor_pusat: string
  total_luas_hektar: number
  total_blok: number
  total_sensor: number
  total_gateway: number
  kebuns: Array<{
    id_kebun: string
    nama_kebun: string
    lokasi: string
    latitude: number
    longitude: number
    nama_pengelola: string
    total_blok_aktif: number
    bloks: Array<{
      id_blok: string
      nama_blok: string
      luas_area: number
      varietas_naga: string
      jumlah_tiang: number
    }>
  }>
}
