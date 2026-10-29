export interface BackendKebunDTO {
  id_kebun: string;
  nama_kebun: string;
  lokasi_kebun?: string | null;
  luas_lahan?: number | null;
  status_kebun?: boolean;
}
