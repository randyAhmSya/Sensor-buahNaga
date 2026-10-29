export interface BackendBlokDTO {
  id_blok: string;
  nama_blok: string;
  kebun_id: string;
  kebun?: {
    id_kebun?: string;
    nama_kebun?: string;
  };
}

export interface BackendSensorDTO {
  id_sensor: string;
  blok_id: string;
  kode_perangkat: string;
  status_koneksi: "online" | "offline" | "terhubung" | "terputus" | string;
  terakhir_terlihat?: string | null;
  blok?: BackendBlokDTO;
  kebun?: {
    id_kebun?: string;
    nama_kebun?: string;
  };
  gateway?: {
    id_gateway?: string;
    nama_gateway?: string;
    status_koneksi?: string;
  };
  qr?: {
    id_qr?: string;
    teks_kode_qr?: string;
    status_qr?: boolean;
  };
}
