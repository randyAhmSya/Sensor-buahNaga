import type { HarvestCycle } from '../types/harvest.types.ts';

export interface KnownBlockLookup {
  id: string;
  name: string;
  farmName?: string;
  farmId?: string;
}

export const normalizeHarvestCycle = (
  raw: unknown,
  defaultBlockName?: string,
  defaultFarmName?: string
): HarvestCycle => {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
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

  const rawStatus = String(item.status_siklus || item.status || 'BERJALAN').toUpperCase();
  const statusSiklus: 'BERJALAN' | 'SELESAI' = rawStatus === 'SELESAI' ? 'SELESAI' : 'BERJALAN';

  const rawBlok = (item.blok || item.block) as Record<string, unknown> | undefined;
  const rawKebun = (rawBlok?.kebun || rawBlok?.farm || item.kebun) as Record<string, unknown> | undefined;

  const blockName =
    (item.blockName as string) ||
    (rawBlok?.nama_blok as string) ||
    defaultBlockName ||
    '';

  const farmName =
    (item.farmName as string) ||
    (rawKebun?.nama_kebun as string) ||
    defaultFarmName ||
    '';

  return {
    id_siklus_panen: idSiklus,
    block_id: blockId,
    tanggal_penyinaran: String(item.tanggal_penyinaran || item.lightingDate || item.tanggal_mulai || ''),
    target_hari_berbunga: Number(item.target_hari_berbunga || item.bloomingTargetDays || item.target_berbunga || 0),
    target_hari_panen_setelah_bunga:
      item.target_hari_panen_setelah_bunga !== undefined
        ? Number(item.target_hari_panen_setelah_bunga)
        : 0,
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

/**
 * Memetakan daftar siklus panen mentah dari endpoint backend
 * ke array HarvestCycle terstandarisasi, dengan mengisi nama blok dan nama kebun
 * berdasarkan kecocokan block_id.
 */
export const mapSiklusListToHarvestCycles = (
  rawCycles: unknown[] | null | undefined,
  blocks?: KnownBlockLookup[] | null
): HarvestCycle[] => {
  if (!rawCycles || !Array.isArray(rawCycles)) {
    return [];
  }

  const blockMap = new Map<string, { name: string; farmName?: string }>();
  if (blocks && Array.isArray(blocks)) {
    for (const b of blocks) {
      if (!b || !b.id) continue;
      const cleanId = String(b.id).trim().toLowerCase();
      blockMap.set(cleanId, {
        name: b.name || '',
        farmName: b.farmName || '',
      });
    }
  }

  const result: HarvestCycle[] = [];
  for (const raw of rawCycles) {
    if (!raw) continue;
    const item = raw as Record<string, unknown>;
    const rawBlockId = String(item.block_id || item.blok_id || item.id_blok || '').trim().toLowerCase();
    const matchedBlock = blockMap.get(rawBlockId);

    const cycle = normalizeHarvestCycle(raw, matchedBlock?.name, matchedBlock?.farmName);
    result.push(cycle);
  }

  return result.sort((a, b) => {
    const dateA = new Date(a.tanggal_penyinaran).getTime() || 0;
    const dateB = new Date(b.tanggal_penyinaran).getTime() || 0;
    return dateB - dateA;
  });
};
