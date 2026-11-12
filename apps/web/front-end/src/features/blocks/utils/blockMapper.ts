import type { BlokBackend, BlockItem } from '../../../types/block.types.ts';
import { DEFAULT_FARM_TEMPLATE_IMAGE } from '../../../config/constants.ts';

/**
 * Memetakan blok backend tunggal (dari payload agregat kebun?include=blok)
 * menjadi BlockItem antarmuka pengguna.
 *
 * Karena jalur agregat tidak memuat relasi node sensor,
 * status node dan label nodeSensor diberi penanda netral 'Tidak Diketahui'
 * (bukan 'Belum Terpasang').
 */
export const mapBlokToAgregatBlockItem = (blok: BlokBackend): BlockItem => {
  const blokId = String(blok.id_blok || blok.id || '').trim();
  const photoUrl =
    blok.url_foto && blok.url_foto.trim() !== ''
      ? blok.url_foto
      : DEFAULT_FARM_TEMPLATE_IMAGE;

  const rawEstimate = blok.estimasi_panen || blok.harvest_date;
  const cleanEstimate =
    rawEstimate &&
    rawEstimate.trim() &&
    rawEstimate !== '--' &&
    rawEstimate !== 'Belum Dijadwalkan'
      ? rawEstimate.trim()
      : '';

  return {
    id: blokId,
    id_blok: blokId,
    name: blok.nama_blok || '',
    description: blok.keterangan || '',
    area: blok.luas_area ? `${blok.luas_area} m²` : 'Belum diatur',
    nodeSensor: 'Tidak Diketahui',
    status: 'Tidak Diketahui',
    imageUrl: photoUrl,
    harvestEstimate: cleanEstimate || 'Belum Dijadwalkan',
  };
};

/**
 * Memetakan kumpulan blok backend ke BlockItem[].
 * Mengembalikan array kosong jika input null, undefined, atau bukan array.
 */
export const mapBloksToBlockItems = (
  bloks: BlokBackend[] | null | undefined
): BlockItem[] => {
  if (!bloks || !Array.isArray(bloks)) {
    return [];
  }
  return bloks.map(mapBlokToAgregatBlockItem);
};
