import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { KodeQrBackend, CreateQrPayload, UpdateQrPayload, QRCodeItem } from '@/types/qr.types';

export const mapQrBackendToItem = (qr: KodeQrBackend): QRCodeItem => {
  const qrAny = qr as unknown as Record<string, unknown>;
  const nestedBlock = qr.node_sensor?.blok || (qrAny.blok as { nama_blok?: string; kebun?: { nama_kebun?: string } } | undefined);
  const nestedKebun = qr.node_sensor?.blok?.kebun || nestedBlock?.kebun || (qrAny.kebun as { nama_kebun?: string } | undefined);

  const farmName = nestedKebun?.nama_kebun || 'Kebun Buah Naga';
  const blockName = nestedBlock?.nama_blok || 'Semua Blok';
  const isPaired = Boolean(qr.node_sensor?.id_sensor || qr.node_sensor?.kode_perangkat);

  const isStatusActive = qr.status_qr === true || qr.status_qr === 1 || String(qr.status_qr) === 'true';

  let formattedDate = 'Baru Saja';
  if (qr.created_at) {
    try {
      formattedDate = new Date(qr.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      formattedDate = qr.created_at;
    }
  }

  return {
    id: qr.id_qr,
    codeText: qr.teks_kode_qr,
    qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qr.teks_kode_qr)}`,
    farmName,
    blockName,
    status: isStatusActive ? 'Aktif' : 'Nonaktif',
    pairingStatus: isPaired ? 'Sudah Terhubung' : 'Belum Terhubung',
    createdAt: formattedDate,
  };
};

export interface ScannedQRResult {
  id_sensor: string;
  kode_perangkat: string;
  tipe_sensor?: string;
  status_koneksi?: string;
  terakhir_terlihat?: string | null;
  blok: {
    id_blok: string;
    nama_blok: string;
    luas_area?: number | string | null;
    kebun: {
      id_kebun: string;
      nama_kebun: string;
      lokasi_kebun?: string | null;
    };
  };
}

export const qrCodeService = {
  getAll: async (): Promise<QRCodeItem[]> => {
    try {
      const res = await apiClient.get<ApiResponse<KodeQrBackend[]>>('/petani/qr');
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(mapQrBackendToItem);
      }
    } catch {
      // Return array kosong saat API offline / belum ada data
    }
    return [];
  },

  lookupOrScan: async (codeText: string): Promise<ScannedQRResult | null> => {
    const cleanCode = codeText.trim();
    if (!cleanCode) return null;

    // 1. Coba tembak endpoint scan backend jika tersedia
    try {
      const res = await apiClient.post<ApiResponse<ScannedQRResult>>('/petani/qr/scan', {
        teks_kode_qr: cleanCode,
      });
      if (res && res.data && res.data.id_sensor) {
        return res.data;
      }
    } catch {
      // Endpoint belum ada atau offline, gunakan fallback lookup
    }

    // 2. Fallback: Cari di daftar QR yang ada
    try {
      const res = await apiClient.get<ApiResponse<KodeQrBackend[]>>('/petani/qr');
      if (res && Array.isArray(res.data)) {
        const found = res.data.find(
          (q) => q.teks_kode_qr?.toLowerCase() === cleanCode.toLowerCase()
        );
        if (found && found.node_sensor) {
          const ns = found.node_sensor;
          const blk = ns.blok || (found as unknown as { blok?: { id_blok: string; nama_blok: string; kebun?: { id_kebun: string; nama_kebun: string } } }).blok;
          const kbn = blk?.kebun;

          return {
            id_sensor: ns.id_sensor || `SNS-${cleanCode}`,
            kode_perangkat: ns.kode_perangkat || cleanCode,
            tipe_sensor: (ns as { tipe_sensor?: string }).tipe_sensor || 'lux_suhu',
            status_koneksi: (ns as { status_koneksi?: string }).status_koneksi || 'aktif',
            blok: {
              id_blok: blk?.id_blok || 'blok-default',
              nama_blok: blk?.nama_blok || 'Blok Utama',
              kebun: {
                id_kebun: kbn?.id_kebun || 'kebun-default',
                nama_kebun: kbn?.nama_kebun || 'Kebun Buah Naga',
              },
            },
          };
        }
      }
    } catch {
      // Abaikan
    }

    return null;
  },

  create: async (payload: CreateQrPayload): Promise<ApiResponse<KodeQrBackend>> => {
    const body: Record<string, unknown> = {};
    if (payload.teks_kode_qr) body.teks_kode_qr = payload.teks_kode_qr;
    if (payload.kode_unik) body.kode_unik = payload.kode_unik;
    if (payload.blok_id) body.blok_id = payload.blok_id;
    if (payload.kebun_id) body.kebun_id = payload.kebun_id;
    if (payload.status_qr !== undefined) {
      body.status_qr = (payload.status_qr === true || payload.status_qr === 1) ? 1 : 0;
    }
    return await apiClient.post<ApiResponse<KodeQrBackend>>('/petani/qr', body);
  },

  update: async (id: string, payload: UpdateQrPayload): Promise<ApiResponse<KodeQrBackend>> => {
    const body: Record<string, unknown> = {};
    if (payload.teks_kode_qr !== undefined) body.teks_kode_qr = payload.teks_kode_qr;
    if (payload.status_qr !== undefined) {
      body.status_qr = (payload.status_qr === true || payload.status_qr === 1) ? 1 : 0;
    }
    return await apiClient.put<ApiResponse<KodeQrBackend>>(`/petani/qr/${id}`, body);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete<ApiResponse<null>>(`/petani/qr/${id}`);
      return true;
    } catch {
      return true;
    }
  },
};

