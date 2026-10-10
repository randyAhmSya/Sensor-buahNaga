/**
 * Definisi Tipe Entitas Kebun (Farms) Backend Laravel AgroLight
 */

export interface KebunBackend {
  id_kebun: string;
  id?: string;
  tenant_id: string;
  nama_kebun: string;
  lokasi_kebun: string | null;
  url_foto: string | null;
  status_kebun: boolean | number | string;
  keterangan?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateKebunPayload {
  tenant_id?: string;
  nama_kebun: string;
  lokasi_kebun?: string;
  status_kebun?: boolean;
  foto?: File;
}

export interface UpdateKebunPayload {
  nama_kebun?: string;
  lokasi_kebun?: string;
  status_kebun?: boolean;
  foto?: File;
}
