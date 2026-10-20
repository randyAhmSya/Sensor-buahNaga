import { apiClient } from './api';
import type { PetaniNotificationItem, RawPetaniNotification } from '@/types/notification.types';

export interface GetNotificationsParams {
  belum_dibaca?: boolean;
  page?: number;
  per_page?: number;
}

interface ApiResponseEnvelope<T> {
  status?: string;
  pesan?: string;
  message?: string;
  data: T;
}

export const notificationService = {
  /**
   * GET /petani/notifikasi
   * Mengambil daftar notifikasi petani tanpa data dummy.
   * Mendukung filter belum_dibaca=true|false.
   */
  async getPetaniNotifications(params?: GetNotificationsParams): Promise<PetaniNotificationItem[]> {
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.belum_dibaca !== undefined) {
        queryParams.belum_dibaca = params.belum_dibaca;
      }
      if (params?.page !== undefined) {
        queryParams.page = params.page;
      }
      if (params?.per_page !== undefined) {
        queryParams.per_page = params.per_page;
      }

      const res = await apiClient.get<ApiResponseEnvelope<unknown>>('/petani/notifikasi', {
        params: queryParams,
      });

      // Ekstraksi data dari berbagai format envelope response (termasuk Laravel paginator)
      let rawList: unknown[] = [];
      const body = res?.data;

      if (Array.isArray(body)) {
        rawList = body;
      } else if (body && typeof body === 'object') {
        const nestedData = (body as { data?: unknown }).data;
        if (Array.isArray(nestedData)) {
          rawList = nestedData;
        } else if (nestedData && typeof nestedData === 'object' && Array.isArray((nestedData as { data?: unknown }).data)) {
          // Format envelope Laravel Resource Paginator: response.data.data
          rawList = (nestedData as { data: unknown[] }).data;
        } else if (nestedData && typeof nestedData === 'object' && Array.isArray((nestedData as { items?: unknown }).items)) {
          rawList = (nestedData as { items: unknown[] }).items;
        } else if (Array.isArray((body as { items?: unknown }).items)) {
          rawList = (body as { items: unknown[] }).items;
        }
      }

      return rawList.map((item) => {
        const raw = item as RawPetaniNotification;
        const isRead = Boolean(
          raw.sudah_dibaca ?? raw.dibaca ?? raw.is_read ?? false
        );

        let cleanType: PetaniNotificationItem['tipe'] = 'info';
        if (raw.tipe === 'peringatan' || raw.tipe === 'warning') {
          cleanType = 'peringatan';
        } else if (raw.tipe === 'sistem' || raw.tipe === 'system') {
          cleanType = 'sistem';
        }

        return {
          id: raw.id,
          judul: raw.judul || raw.title || 'Pemberitahuan Sistem',
          pesan: raw.pesan || raw.message || '',
          tipe: cleanType,
          sudah_dibaca: isRead,
          created_at: raw.created_at || raw.waktu || new Date().toISOString(),
          tautan: raw.tautan || raw.link,
        };
      });
    } catch {
      // Sesuai instruksi: tanpa mock/dummy data, return array kosong jika gagal
      return [];
    }
  },

  /**
   * PATCH /petani/notifikasi/{id}/dibaca
   * Menandai satu item notifikasi sebagai sudah dibaca
   */
  async markAsRead(id: string | number): Promise<void> {
    await apiClient.patch(`/petani/notifikasi/${id}/dibaca`);
  },

  /**
   * PATCH /petani/notifikasi/tandai-semua-dibaca
   * Menandai seluruh notifikasi petani sebagai sudah dibaca
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/petani/notifikasi/tandai-semua-dibaca');
  },
};
