import { apiClient } from './api';
import type { ApiResponse } from '@/types/api.types';
import type {
  HarvestCycle,
  StartHarvestCyclePayload,
  UpdateHarvestActualPayload,
  RecordFlowerPayload,
  RecordHarvestPayload,
} from '@/features/harvests/types/harvest.types';
import { farmService } from './farmService';

/**
 * Normalisasi data siklus panen dari berbagai kemungkinan format backend
 */
const normalizeHarvestCycle = (raw: unknown, defaultBlockName?: string, defaultFarmName?: string): HarvestCycle => {
  const item = (raw || {}) as Record<string, unknown>;
  const idSiklus = String(
    item.id_siklus_panen ||
    item.id ||
    item.uuid ||
    item.id_siklus ||
    ''
  );
  const blockId = String(
    item.block_id ||
    item.blok_id ||
    item.id_blok ||
    ''
  );

  // Status backend: "BERJALAN" | "SELESAI"
  const rawStatus = String(item.status_siklus || item.status || 'BERJALAN').toUpperCase();
  const statusSiklus: 'BERJALAN' | 'SELESAI' = rawStatus === 'SELESAI' ? 'SELESAI' : 'BERJALAN';

  const rawBlok = (item.blok || item.block) as Record<string, unknown> | undefined;
  const rawKebun = (rawBlok?.kebun || rawBlok?.farm || item.kebun) as Record<string, unknown> | undefined;

  const blockName =
    (item.blockName as string) ||
    (rawBlok?.nama_blok as string) ||
    defaultBlockName ||
    'Blok Lahan';

  const farmName =
    (item.farmName as string) ||
    (rawKebun?.nama_kebun as string) ||
    defaultFarmName ||
    'Kebun Buah Naga';

  return {
    id_siklus_panen: idSiklus,
    block_id: blockId,
    tanggal_penyinaran: String(item.tanggal_penyinaran || item.lightingDate || item.tanggal_mulai || ''),
    target_hari_berbunga: Number(item.target_hari_berbunga || item.bloomingTargetDays || item.target_berbunga || 20),
    target_hari_panen_setelah_bunga:
      item.target_hari_panen_setelah_bunga !== undefined
        ? Number(item.target_hari_panen_setelah_bunga)
        : 50,
    estimasi_tanggal_panen: String(item.estimasi_tanggal_panen || item.estimatedHarvestDate || item.estimasi_panen || ''),
    tanggal_berbunga_aktual:
      item.tanggal_berbunga_aktual !== undefined && item.tanggal_berbunga_aktual !== null
        ? String(item.tanggal_berbunga_aktual)
        : null,
    tanggal_panen:
      item.tanggal_panen !== undefined && item.tanggal_panen !== null
        ? String(item.tanggal_panen)
        : (item.actualHarvestDate ? String(item.actualHarvestDate) : null),
    status_siklus: statusSiklus,
    blockName,
    farmName,
    blok: rawBlok as HarvestCycle['blok'],
    created_at: item.created_at ? String(item.created_at) : undefined,
    updated_at: item.updated_at ? String(item.updated_at) : undefined,
  };
};

export const harvestService = {
  /**
   * Mengambil daftar siklus panen per blok aktif (Wajib query param blok_id)
   * GET /api/petani/siklus-panen?blok_id=UUID-BLOK
   */
  getHarvestCycles: async (
    blokId: string,
    meta?: { blockName?: string; farmName?: string }
  ): Promise<HarvestCycle[]> => {
    if (!blokId || typeof blokId !== 'string' || !blokId.trim()) {
      return [];
    }

    try {
      const res = await apiClient.get<unknown>('/petani/siklus-panen', {
        params: { blok_id: blokId.trim() },
      });

      let rawArray: unknown[] = [];
      if (Array.isArray(res)) {
        rawArray = res;
      } else if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) {
          rawArray = obj.data;
        } else if (obj.data && typeof obj.data === 'object') {
          const nested = obj.data as Record<string, unknown>;
          if (Array.isArray(nested.data)) {
            rawArray = nested.data;
          } else if (Array.isArray(nested.siklus)) {
            rawArray = nested.siklus;
          } else if (Array.isArray(nested.siklus_panen)) {
            rawArray = nested.siklus_panen;
          } else if (
            nested.id_siklus_panen ||
            nested.status_siklus ||
            nested.tanggal_penyinaran ||
            nested.id
          ) {
            rawArray = [nested];
          }
        } else if (Array.isArray(obj.siklus)) {
          rawArray = obj.siklus;
        } else if (Array.isArray(obj.siklus_panen)) {
          rawArray = obj.siklus_panen;
        } else if (
          obj.id_siklus_panen ||
          obj.status_siklus ||
          obj.tanggal_penyinaran ||
          obj.id
        ) {
          rawArray = [obj];
        }
      }

      return rawArray.map((item) =>
        normalizeHarvestCycle(item, meta?.blockName, meta?.farmName)
      );
    } catch {
      return [];
    }
  },

  /**
   * Mengambil detail siklus panen berdasarkan ID
   * GET /api/petani/siklus-panen/{id_siklus_panen}
   */
  getDetailHarvestCycle: async (idSiklus: string): Promise<HarvestCycle | null> => {
    if (!idSiklus || !idSiklus.trim()) return null;

    try {
      const res = await apiClient.get<ApiResponse<unknown>>(`/petani/siklus-panen/${idSiklus.trim()}`);
      const rawData = res && typeof res === 'object' && 'data' in res ? res.data : res;
      if (!rawData) return null;
      return normalizeHarvestCycle(rawData);
    } catch {
      return null;
    }
  },

  /**
   * Mulai Siklus Panen Baru
   * POST /api/petani/siklus-panen
   * Payload: { block_id: "UUID", tanggal_penyinaran: "YYYY-MM-DD", target_hari_berbunga: 20 }
   */
  startHarvestCycle: async (payload: StartHarvestCyclePayload): Promise<HarvestCycle> => {
    const body = {
      block_id: payload.block_id,
      tanggal_penyinaran: payload.tanggal_penyinaran,
      target_hari_berbunga: Number(payload.target_hari_berbunga || 20),
    };

    const res = await apiClient.post<ApiResponse<unknown>>('/petani/siklus-panen', body);
    const createdData = res && typeof res === 'object' && 'data' in res ? res.data : res;
    return normalizeHarvestCycle(createdData);
  },

  /**
   * Catat Bunga Aktual atau Catat Panen Nyata
   * PUT /api/petani/siklus-panen/{id_siklus_panen}
   * Opsi A: { tanggal_berbunga_aktual: "YYYY-MM-DD" }
   * Opsi B: { tanggal_panen: "YYYY-MM-DD" } (Status otomatis berubah ke "SELESAI" oleh backend)
   */
  updateHarvestActual: async (
    idSiklus: string,
    payload: UpdateHarvestActualPayload
  ): Promise<HarvestCycle> => {
    const cleanPayload: Record<string, string> = {};
    if ('tanggal_berbunga_aktual' in payload && payload.tanggal_berbunga_aktual) {
      cleanPayload.tanggal_berbunga_aktual = payload.tanggal_berbunga_aktual;
    }
    if ('tanggal_panen' in payload && payload.tanggal_panen) {
      cleanPayload.tanggal_panen = payload.tanggal_panen;
    }

    const res = await apiClient.put<ApiResponse<unknown>>(
      `/petani/siklus-panen/${idSiklus.trim()}`,
      cleanPayload
    );
    const updatedData = res && typeof res === 'object' && 'data' in res ? res.data : res;
    return normalizeHarvestCycle(updatedData);
  },

  /**
   * Catat Bunga Aktual secara spesifik
   */
  recordFlower: async (idSiklus: string, payload: RecordFlowerPayload): Promise<HarvestCycle> => {
    return harvestService.updateHarvestActual(idSiklus, payload);
  },

  /**
   * Catat Tanggal Panen Nyata (Otomatis menyelesaikan siklus)
   */
  recordHarvest: async (idSiklus: string, payload: RecordHarvestPayload): Promise<HarvestCycle> => {
    return harvestService.updateHarvestActual(idSiklus, payload);
  },

  /**
   * Hapus Siklus Panen
   * DELETE /api/petani/siklus-panen/{id_siklus_panen}
   */
  deleteHarvestCycle: async (idSiklus: string): Promise<boolean> => {
    if (!idSiklus || !idSiklus.trim()) return false;
    await apiClient.delete<ApiResponse<unknown>>(`/petani/siklus-panen/${idSiklus.trim()}`);
    return true;
  },

  /**
   * Mengambil semua siklus panen dari kumpulan blok (atau seluruh kebun aktif)
   * Berguna untuk menampilkan tabel terpadu dan menghitung total di Dashboard
   */
  getAllCycles: async (
    knownBlocks?: { id: string; name: string; farmName?: string }[]
  ): Promise<HarvestCycle[]> => {
    let blockList = knownBlocks;

    if (!blockList || blockList.length === 0) {
      try {
        const farms = await farmService.getAll();
        blockList = farms.flatMap((farm) =>
          (farm.blocks || []).map((blk) => ({
            id: blk.id,
            name: blk.name,
            farmName: farm.name,
          }))
        );
      } catch {
        blockList = [];
      }
    }

    if (!blockList || blockList.length === 0) {
      return [];
    }

    const results = await Promise.allSettled(
      blockList.map((b) =>
        harvestService.getHarvestCycles(b.id, {
          blockName: b.name,
          farmName: b.farmName,
        })
      )
    );

    const mergedCycles: HarvestCycle[] = [];
    results.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        mergedCycles.push(...res.value);
      }
    });

    // Urutkan berdasarkan tanggal penyinaran terbaru
    return mergedCycles.sort((a, b) => {
      const dateA = new Date(a.tanggal_penyinaran).getTime() || 0;
      const dateB = new Date(b.tanggal_penyinaran).getTime() || 0;
      return dateB - dateA;
    });
  },

  /**
   * Kompatibilitas alias untuk pemanggilan getAll() lama
   */
  getAll: async (): Promise<HarvestCycle[]> => {
    return harvestService.getAllCycles();
  },
};
