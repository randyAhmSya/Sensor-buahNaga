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
import {
  normalizeHarvestCycle,
  mapSiklusListToHarvestCycles,
} from '@/features/harvests/utils/harvestCycleMapper';

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
   * Mengambil semua siklus panen dari seluruh kebun aktif dalam satu request per kebun
   * Endpoint: GET /api/petani/siklus-panen?kebun_id={id}
   */
  getAllCycles: async (
    knownBlocks?: Array<{ id: string; name: string; farmName?: string; farmId?: string }>
  ): Promise<HarvestCycle[]> => {
    let blockList = knownBlocks;
    let farmIds = Array.from(
      new Set(blockList?.map((b) => b.farmId).filter(Boolean))
    ) as string[];

    // Bila blockList belum ada atau belum memuat farmId, ambil dari farmService.getAllWithBlocks()
    if (!blockList || blockList.length === 0 || farmIds.length === 0) {
      const farms = await farmService.getAllWithBlocks();
      blockList = farms.flatMap((farm) =>
        (farm.blocks || []).map((blk) => ({
          id: blk.id,
          name: blk.name,
          farmName: farm.name,
          farmId: farm.id,
        }))
      );
      farmIds = farms.map((f) => f.id).filter(Boolean);
    }

    if (farmIds.length === 0) {
      return [];
    }

    // Panggil GET /petani/siklus-panen?kebun_id={id} untuk setiap kebun secara paralel
    const fetchPromises = farmIds.map(async (fId) => {
      const res = await apiClient.get<ApiResponse<unknown[]>>('/petani/siklus-panen', {
        params: { kebun_id: fId.trim() },
      });
      return Array.isArray(res.data) ? res.data : [];
    });

    const results = await Promise.all(fetchPromises);
    const allRawCycles = results.flat();

    return mapSiklusListToHarvestCycles(allRawCycles, blockList);
  },

  /**
   * Kompatibilitas alias untuk pemanggilan getAll() lama
   */
  getAll: async (): Promise<HarvestCycle[]> => {
    return harvestService.getAllCycles();
  },
};
