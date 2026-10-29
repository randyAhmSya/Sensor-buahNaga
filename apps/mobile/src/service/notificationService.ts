import apiClient from './apiClient';
import type {
  NotifikasiItem,
  NotifikasiListResponse,
  PaginationMeta,
  TandaiSemuaDibacaResponse,
} from '@/types/notification';
import { type NotificationSetting } from '@/constant/NotificationSetting';

export interface GetNotifikasiParams {
  belum_dibaca?: boolean;
  per_page?: number;
  page?: number;
}

export interface GetNotifikasiResult {
  items: NotifikasiItem[];
  meta?: PaginationMeta;
}

export const notificationService = {
  /**
   * Mengambil daftar notifikasi petani dari backend.
   * Endpoint: GET /api/petani/notifikasi
   */
  async getNotifikasi(params?: GetNotifikasiParams): Promise<GetNotifikasiResult> {
    const res = await apiClient.get<NotifikasiListResponse>('/petani/notifikasi', {
      params: {
        belum_dibaca: params?.belum_dibaca ? 1 : undefined,
        per_page: params?.per_page ?? 20,
        page: params?.page ?? 1,
      },
    });

    const items = res.data?.data ?? [];
    const meta = res.data?.meta;

    return {
      items,
      meta,
    };
  },

  /**
   * Mengambil total jumlah notifikasi yang belum dibaca (ringan: per_page=1).
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<NotifikasiListResponse>('/petani/notifikasi', {
        params: {
          belum_dibaca: 1,
          per_page: 1,
        },
      });
      return res.data?.meta?.total ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Menandai 1 notifikasi spesifik sebagai sudah dibaca.
   * Endpoint: PATCH /api/petani/notifikasi/{id}/dibaca
   */
  async tandaiDibaca(id: string): Promise<NotifikasiItem> {
    const res = await apiClient.patch<{ success?: boolean; data: NotifikasiItem }>(
      `/petani/notifikasi/${id}/dibaca`,
    );
    return res.data?.data;
  },

  /**
   * Menandai seluruh notifikasi tenant sebagai sudah dibaca.
   * Endpoint: PATCH /api/petani/notifikasi/tandai-semua-dibaca
   */
  async tandaiSemuaDibaca(): Promise<number> {
    const res = await apiClient.patch<TandaiSemuaDibacaResponse>(
      '/petani/notifikasi/tandai-semua-dibaca',
    );
    return res.data?.data?.jumlah_ditandai ?? 0;
  },
};

// ==========================================
// LEGACY SETTINGS COMPATIBILITY
// ==========================================
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: 'temperature-critical',
    title: 'Suhu Kritis / Peringatan Panas',
    description: 'Kirim alert jika suhu kebun melebihi batas aman.',
    active: true,
  },
  {
    id: 'node-offline',
    title: 'Perangkat Node Offline',
    description: 'Kirim alert jika hardware ESP32 terputus dari internet.',
    active: true,
  },
  {
    id: 'auto-dimming',
    title: 'Perubahan Mode Auto-Dimming',
    description: 'Notifikasi saat sistem lampu beralih ke kontrol manual.',
    active: false,
  },
  {
    id: 'harvest-summary',
    title: 'Ringkasan Estimasi Panen',
    description: 'Pengingat mingguan mendekati tanggal panen.',
    active: true,
  },
];

let currentSettings: NotificationSetting[] = [...DEFAULT_NOTIFICATION_SETTINGS];

export async function fetchNotificationSettings(): Promise<NotificationSetting[]> {
  try {
    await apiClient.get('/petani/notifikasi', { params: { per_page: 1 } });
  } catch {
    // Graceful offline fallback
  }
  return [...currentSettings];
}

export async function updateNotificationSetting(
  id: string,
  active: boolean,
): Promise<NotificationSetting> {
  const index = currentSettings.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error('Pengaturan notifikasi tidak ditemukan.');
  }
  const updated: NotificationSetting = {
    ...currentSettings[index],
    active,
  };
  currentSettings[index] = updated;
  return updated;
}

export default notificationService;