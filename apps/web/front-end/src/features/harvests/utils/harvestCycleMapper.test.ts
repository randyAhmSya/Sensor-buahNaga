import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapSiklusListToHarvestCycles,
  normalizeHarvestCycle,
} from './harvestCycleMapper.ts';

describe('harvestCycleMapper - Pemetaan Siklus Panen ke Blok dan Kebun', () => {
  it('1. Mengembalikan array kosong jika input null, undefined, atau array kosong', () => {
    assert.deepEqual(mapSiklusListToHarvestCycles(null), []);
    assert.deepEqual(mapSiklusListToHarvestCycles(undefined), []);
    assert.deepEqual(mapSiklusListToHarvestCycles([]), []);
  });

  it('2. Mengisi blockName dan farmName berdasarkan kecocokan block_id', () => {
    const rawCycles = [
      {
        id_siklus_panen: 'cycle-1',
        block_id: 'block-uuid-1',
        tanggal_penyinaran: '2026-11-01',
        target_hari_berbunga: 20,
        target_hari_panen_setelah_bunga: 30,
        estimasi_tanggal_panen: '2026-12-21',
        status_siklus: 'BERJALAN',
      },
    ];

    const blocks = [
      {
        id: 'block-uuid-1',
        name: 'Blok Anggur Merah',
        farmName: 'Kebun Sentosa',
      },
    ];

    const result = mapSiklusListToHarvestCycles(rawCycles, blocks);
    assert.equal(result.length, 1);
    assert.equal(result[0].id_siklus_panen, 'cycle-1');
    assert.equal(result[0].block_id, 'block-uuid-1');
    assert.equal(result[0].blockName, 'Blok Anggur Merah');
    assert.equal(result[0].farmName, 'Kebun Sentosa');
    assert.equal(result[0].status_siklus, 'BERJALAN');
  });

  it('3. Menangani siklus yang block_id tidak ditemukan pada daftar blok', () => {
    const rawCycles = [
      {
        id_siklus_panen: 'cycle-2',
        block_id: 'block-unknown',
        tanggal_penyinaran: '2026-10-15',
        status_siklus: 'SELESAI',
      },
    ];

    const blocks = [
      {
        id: 'block-uuid-1',
        name: 'Blok A',
        farmName: 'Kebun Utama',
      },
    ];

    const result = mapSiklusListToHarvestCycles(rawCycles, blocks);
    assert.equal(result.length, 1);
    assert.equal(result[0].blockName, '');
    assert.equal(result[0].farmName, '');
    assert.equal(result[0].status_siklus, 'SELESAI');
  });

  it('4. Mengurutkan siklus berdasarkan tanggal penyinaran terbaru secara menurun', () => {
    const rawCycles = [
      {
        id_siklus_panen: 'cycle-old',
        block_id: 'block-1',
        tanggal_penyinaran: '2026-09-01',
      },
      {
        id_siklus_panen: 'cycle-new',
        block_id: 'block-1',
        tanggal_penyinaran: '2026-11-10',
      },
    ];

    const result = mapSiklusListToHarvestCycles(rawCycles);
    assert.equal(result.length, 2);
    assert.equal(result[0].id_siklus_panen, 'cycle-new');
    assert.equal(result[1].id_siklus_panen, 'cycle-old');
  });

  it('5. normalizeHarvestCycle menangani item bukan objek atau kosong', () => {
    const cycle = normalizeHarvestCycle(null);
    assert.equal(cycle.id_siklus_panen, '');
    assert.equal(cycle.block_id, '');
    assert.equal(cycle.status_siklus, 'BERJALAN');
  });
});
