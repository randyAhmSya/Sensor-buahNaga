import { apiClient, isApiSuccess } from './api';
import type { ApiResponse } from '@/types/api.types';
import type { 
  KodeQrBackend, 
  UpdateQrPayload, 
  ScanQrPayload, 
  QrScanLogItem 
} from '@/types/qr.types';

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
  /**
   * Pindai kode QR fisik untuk mendapatkan informasi blok dan sensor terkait
   */
  async scan(payload: ScanQrPayload): Promise<ScannedQRResult> {
    const res = await apiClient.post<ApiResponse<ScannedQRResult>>('/petani/qr/scan', {
      teks_kode_qr: payload.teks_kode_qr.trim(),
      platform: payload.platform || 'web',
      latitude: payload.latitude,
      longitude: payload.longitude,
    });
    return res.data;
  },

  /**
   * Mengambil riwayat aktivitas scan QR oleh user petani yang sedang login
   */
  async getLogs(): Promise<QrScanLogItem[]> {
    const res = await apiClient.get<ApiResponse<QrScanLogItem[]>>('/petani/qr/logs');
    if (isApiSuccess(res) && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Mengambil detail satu kode QR spesifik milik kebun tenant
   */
  async getDetail(id: string): Promise<KodeQrBackend | null> {
    const res = await apiClient.get<ApiResponse<KodeQrBackend>>(`/petani/qr/${id}`);
    if (isApiSuccess(res) && res.data) {
      return res.data;
    }
    return null;
  },

  /**
   * Memperbarui status kode QR milik node sensor petani
   */
  async update(id: string, payload: UpdateQrPayload): Promise<KodeQrBackend> {
    const body: Record<string, unknown> = {};
    if (payload.teks_kode_qr !== undefined) body.teks_kode_qr = payload.teks_kode_qr;
    if (payload.status_qr !== undefined) {
      body.status_qr = (payload.status_qr === true || payload.status_qr === 1) ? 1 : 0;
    }
    const res = await apiClient.put<ApiResponse<KodeQrBackend>>(`/petani/qr/${id}`, body);
    return res.data;
  },
};
