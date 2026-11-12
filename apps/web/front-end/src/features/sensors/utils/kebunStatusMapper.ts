import type { BlokStatusLampuPerBlok, BlokStatusLampuResponse } from '../../../types/block.types.ts';

/**
 * Memetakan array status lampu kebun (GET /petani/kebun/{id}/status-lampu)
 * menjadi Map berindeks blok_id.
 *
 * Mengembalikan Map kosong jika input null, undefined, atau bukan array.
 */
export const mapKebunStatusToBlockStatusMap = (
  items: BlokStatusLampuPerBlok[] | null | undefined
): Map<string, BlokStatusLampuResponse> => {
  const map = new Map<string, BlokStatusLampuResponse>();
  if (!items || !Array.isArray(items)) {
    return map;
  }

  for (const item of items) {
    if (!item) continue;
    const blokId = String(item.blok_id || '').trim();
    if (!blokId) continue;

    map.set(blokId, {
      jumlah_node: item.jumlah_node ?? (item.nodes ? item.nodes.length : 0),
      node_online: item.node_online ?? 0,
      node_offline: item.node_offline ?? 0,
      jumlah_lampu: item.jumlah_lampu ?? 0,
      jumlah_online: item.jumlah_online ?? 0,
      jumlah_offline: item.jumlah_offline ?? 0,
      watt_terpasang: item.watt_terpasang ?? null,
      batas_offline_detik: item.batas_offline_detik ?? 90,
      nodes: Array.isArray(item.nodes) ? item.nodes : [],
    });
  }

  return map;
};
