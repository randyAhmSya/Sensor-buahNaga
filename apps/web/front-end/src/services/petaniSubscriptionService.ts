import { apiClient, isApiSuccess } from './api';
import type { 
  PaketLanggananItem, 
  StatusLanggananPetani, 
  TransaksiPetaniItem,
  AjukanPembelianPayload 
} from '@/types/petaniSubscription.types';
import type { AdminPaginationMeta } from '@/types/admin.types';

interface ApiResponseWrapper<T> {
  status: string;
  pesan: string | null;
  data: T;
  meta?: AdminPaginationMeta;
}

export const petaniSubscriptionService = {
  /**
   * Mengambil katalog paket langganan aktif yang dapat dibeli oleh petani
   */
  async getPaket(): Promise<PaketLanggananItem[]> {
    const res = await apiClient.get<ApiResponseWrapper<PaketLanggananItem[]>>('/petani/langganan/paket');
    if (isApiSuccess(res) && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Mengambil status langganan tenant saat ini (aktif, trial, tenggang, atau kadaluarsa)
   */
  async getStatus(): Promise<StatusLanggananPetani> {
    const res = await apiClient.get<ApiResponseWrapper<StatusLanggananPetani>>('/petani/langganan/status');
    if (isApiSuccess(res) && res.data) {
      return res.data;
    }
    return {
      status_langganan: 'kadaluarsa',
      sisa_hari: 0,
      dalam_masa_tenggang: false,
    };
  },

  /**
   * Mengambil riwayat pengajuan dan transaksi langganan tenant
   */
  async getRiwayat(page = 1, perPage = 15): Promise<{ items: TransaksiPetaniItem[]; meta?: AdminPaginationMeta }> {
    const res = await apiClient.get<ApiResponseWrapper<TransaksiPetaniItem[]>>('/petani/langganan/riwayat', {
      params: { page, per_page: perPage },
    });
    if (isApiSuccess(res) && Array.isArray(res.data)) {
      return {
        items: res.data,
        meta: res.meta,
      };
    }
    return { items: [] };
  },

  /**
   * Mengajukan pembelian paket langganan baru via Transfer Manual dengan upload bukti pembayaran
   */
  async ajukanPembelian(payload: AjukanPembelianPayload): Promise<TransaksiPetaniItem> {
    const formData = new FormData();
    formData.append('paket_langganan_id', payload.paket_langganan_id);
    formData.append('bukti_transfer', payload.bukti_transfer);

    const res = await apiClient.post<ApiResponseWrapper<TransaksiPetaniItem>>('/petani/langganan/beli', formData);
    return res.data;
  },
};
