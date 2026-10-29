import apiClient from './apiClient';
import type {
  SiklusPanenItem,
  CreateSiklusPayload,
  UpdateSiklusPayload,
} from '@/types/harvest';

export const harvestService = {
  /**
   * Mengambil riwayat siklus panen berdasarkan blok lahan.
   * Endpoint: GET /api/petani/siklus-panen?blok_id={uuid}
   */
  async getSiklusByBlok(blokId: string): Promise<SiklusPanenItem[]> {
    const res = await apiClient.get<{
      status?: string;
      success?: boolean;
      data: SiklusPanenItem[];
    }>('/petani/siklus-panen', {
      params: { blok_id: blokId }, // Menggunakan ejaan query param blok_id
    });
    return res.data?.data || [];
  },

  /**
   * Mengambil detail satu siklus panen berdasarkan ID.
   * Endpoint: GET /api/petani/siklus-panen/{id}
   */
  async getSiklusById(id: string): Promise<SiklusPanenItem | null> {
    const res = await apiClient.get<{
      status?: string;
      success?: boolean;
      data: SiklusPanenItem;
    }>(`/petani/siklus-panen/${id}`);
    return res.data?.data || null;
  },

  /**
   * Memulai siklus penyinaran baru.
   * Endpoint: POST /api/petani/siklus-panen
   */
  async createSiklus(payload: CreateSiklusPayload): Promise<SiklusPanenItem> {
    // Body JSON wajib mengirim block_id sesuai validator addSiklusPanenRequest
    const res = await apiClient.post<{
      status?: string;
      success?: boolean;
      data: SiklusPanenItem;
    }>('/petani/siklus-panen', payload);
    return res.data?.data;
  },

  /**
   * Mengupdate data siklus panen.
   * Endpoint: PUT /api/petani/siklus-panen/{id}
   */
  async updateSiklus(
    id: string,
    payload: UpdateSiklusPayload,
  ): Promise<SiklusPanenItem> {
    const res = await apiClient.put<{
      status?: string;
      success?: boolean;
      data: SiklusPanenItem;
    }>(`/petani/siklus-panen/${id}`, payload);
    return res.data?.data;
  },

  /**
   * Mencatat tanggal bunga mekar aktual di lapangan.
   * Backend akan otomatis menghitung ulang estimasi_tanggal_panen secara presisi.
   */
  async catatBungaMekar(
    id: string,
    tanggalBerbunga: string,
  ): Promise<SiklusPanenItem> {
    return this.updateSiklus(id, {
      tanggal_berbunga_aktual: tanggalBerbunga,
    });
  },

  /**
   * Menandai panen selesai pada siklus yang sedang berjalan.
   */
  async tandaiPanenSelesai(
    id: string,
    tanggalPanen?: string,
  ): Promise<SiklusPanenItem> {
    const tgl =
      tanggalPanen || new Date().toISOString().split('T')[0]; // format YYYY-MM-DD
    return this.updateSiklus(id, {
      status_siklus: 'SELESAI',
      tanggal_panen: tgl,
    });
  },
};

export default harvestService;