import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapBloksToBlockItems, mapBlokToAgregatBlockItem } from './blockMapper.ts';
import type { BlokBackend } from '../../../types/block.types.ts';

describe('blockMapper - Pemetaan Agregat bloks ke blocks', () => {
  it('1. Mengembalikan array kosong jika input null, undefined, atau bukan array', () => {
    assert.deepEqual(mapBloksToBlockItems(null), []);
    assert.deepEqual(mapBloksToBlockItems(undefined), []);
    assert.deepEqual(mapBloksToBlockItems([]), []);
  });

  it('2. Memetakan properti blok backend ke BlockItem dengan status netral Tidak Diketahui', () => {
    const rawBloks: BlokBackend[] = [
      {
        id_blok: 'blok-uuid-1',
        nama_blok: 'Blok A',
        keterangan: 'Varietas Merah',
        luas_area: 500,
        url_foto: 'https://example.com/foto-a.jpg',
        estimasi_panen: '2026-12-01',
      },
    ];

    const result = mapBloksToBlockItems(rawBloks);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 'blok-uuid-1');
    assert.equal(result[0].name, 'Blok A');
    assert.equal(result[0].area, '500 m²');
    assert.equal(result[0].description, 'Varietas Merah');
    assert.equal(result[0].imageUrl, 'https://example.com/foto-a.jpg');
    assert.equal(result[0].harvestEstimate, '2026-12-01');
    // Status wajib Tidak Diketahui, bukan Belum Terpasang (data node tidak dimuat di jalur ini)
    assert.equal(result[0].status, 'Tidak Diketahui');
    assert.equal(result[0].nodeSensor, 'Tidak Diketahui');
  });

  it('3. Menangani blok dengan nilai luas_area dan keterangan kosong', () => {
    const rawBlok: BlokBackend = {
      id_blok: 'blok-uuid-2',
      nama_blok: 'Blok B',
      keterangan: null,
      luas_area: null,
      url_foto: null,
    };

    const item = mapBlokToAgregatBlockItem(rawBlok);
    assert.equal(item.id, 'blok-uuid-2');
    assert.equal(item.name, 'Blok B');
    assert.equal(item.area, 'Belum diatur');
    assert.equal(item.description, '');
    assert.equal(item.status, 'Tidak Diketahui');
    assert.equal(item.nodeSensor, 'Tidak Diketahui');
    assert.equal(item.harvestEstimate, 'Belum Dijadwalkan');
  });

  it('4. Mengabaikan estimasi panen bernilai placeholder --', () => {
    const rawBlok: BlokBackend = {
      id_blok: 'blok-uuid-3',
      nama_blok: 'Blok C',
      keterangan: '',
      luas_area: 250,
      url_foto: '',
      estimasi_panen: '--',
    };

    const item = mapBlokToAgregatBlockItem(rawBlok);
    assert.equal(item.harvestEstimate, 'Belum Dijadwalkan');
  });
});
