import apiClient from "./apiClient";
import type {
  PaketLangganan,
  StatusLangganan,
  TransaksiLangganan,
  SnapOnlineResponse,
  PaginationMeta,
} from "@/types/subscription";

export interface BackendResponse<T> {
  status: string;
  pesan?: string;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Service untuk interaksi dengan modul langganan SaaS AgroLight:
 * - GET /api/petani/langganan/paket
 * - GET /api/petani/langganan/status
 * - GET /api/petani/langganan/riwayat
 * - POST /api/petani/langganan/beli
 * - POST /api/petani/langganan/beli-online
 */
export const subscriptionService = {
  /**
   * Mengambil katalog paket langganan aktif.
   */
  async getPaketAktif(): Promise<PaketLangganan[]> {
    const res = await apiClient.get<BackendResponse<PaketLangganan[]>>(
      "/petani/langganan/paket",
    );
    return res.data?.data || [];
  },

  /**
   * Mengambil status langganan tenant saat ini (aktif/kadaluarsa, sisa hari, dsb).
   */
  async getStatus(): Promise<StatusLangganan> {
    const res = await apiClient.get<BackendResponse<StatusLangganan>>(
      "/petani/langganan/status",
    );
    return res.data?.data;
  },

  /**
   * Mengambil riwayat transaksi langganan tenant.
   */
  async getRiwayat(
    page = 1,
    perPage = 15,
  ): Promise<{ items: TransaksiLangganan[]; meta?: PaginationMeta }> {
    const res = await apiClient.get<BackendResponse<TransaksiLangganan[]>>(
      "/petani/langganan/riwayat",
      {
        params: { page, per_page: perPage },
      },
    );
    return {
      items: res.data?.data || [],
      meta: res.data?.meta,
    };
  },

  /**
   * Mengajukan pembelian paket via transfer manual dengan upload bukti transfer.
   */
  async ajukanPembelianManual(
    paketId: string,
    fileUri: string,
    fileName = "bukti_transfer.jpg",
    mimeType = "image/jpeg",
  ): Promise<TransaksiLangganan> {
    const formData = new FormData();
    formData.append("paket_langganan_id", paketId);

    // Di React Native, objek file disematkan dengan bentuk { uri, name, type }
    const filePayload = {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    };
    formData.append("bukti_transfer", filePayload as unknown as Blob);

    const res = await apiClient.post<BackendResponse<TransaksiLangganan>>(
      "/petani/langganan/beli",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return res.data?.data;
  },

  /**
   * Mengajukan pembelian paket online dan menghasilkan Midtrans Snap Token.
   */
  async ajukanPembelianOnline(paketId: string): Promise<SnapOnlineResponse> {
    const res = await apiClient.post<BackendResponse<SnapOnlineResponse>>(
      "/petani/langganan/beli-online",
      { paket_langganan_id: paketId },
    );

    return res.data?.data;
  },

  /**
   * Menghasilkan URL payment gateway Snap berdasarkan token.
   */
  getSnapPaymentUrl(snapToken: string, isProduction = false): string {
    const host = isProduction
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";
    return `${host}/snap/v2/vtweb/${snapToken}`;
  },
};

export default subscriptionService;
