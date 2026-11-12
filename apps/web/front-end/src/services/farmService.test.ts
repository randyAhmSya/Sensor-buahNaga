import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapKebunToFarmItem } from './farmService.ts';
import type { KebunBackend } from '../types/kebun.types.ts';
import type { BlockItem } from '../types/block.types.ts';

describe('farmService - mapKebunToFarmItem', () => {
  const dummyBlockA: BlockItem = {
    id: 'block-01',
    name: 'Blok A',
    status: 'Online',
    area: '500 m2',
  };

  const dummyBlockB: BlockItem = {
    id: 'block-02',
    name: 'Blok B',
    status: 'Offline',
    area: '400 m2',
  };

  it('1. Mengambil totalBlocks dari kebun.bloks_count jika tersedia dari respons backend', () => {
    const rawKebun: KebunBackend = {
      id_kebun: 'kebun-uuid-001',
      tenant_id: 'tenant-01',
      nama_kebun: 'Kebun Buah Naga Banyuwangi',
      lokasi_kebun: 'Kec. Gambiran, Banyuwangi',
      url_foto: null,
      status_kebun: 1,
      bloks_count: 8,
    };

    const result = mapKebunToFarmItem(rawKebun, []);
    assert.equal(result.id, 'kebun-uuid-001');
    assert.equal(result.name, 'Kebun Buah Naga Banyuwangi');
    assert.equal(result.status, 'Aktif');
    assert.equal(result.totalBlocks, 8);
    assert.deepEqual(result.blocks, []);
  });

  it('2. Fallback ke blocks.length jika kebun.bloks_count bernilai undefined', () => {
    const rawKebun: KebunBackend = {
      id_kebun: 'kebun-uuid-002',
      tenant_id: 'tenant-01',
      nama_kebun: 'Kebun Buah Naga Jember',
      lokasi_kebun: 'Kec. Tanggul, Jember',
      url_foto: null,
      status_kebun: true,
      bloks_count: undefined,
    };

    const result = mapKebunToFarmItem(rawKebun, [dummyBlockA, dummyBlockB]);
    assert.equal(result.id, 'kebun-uuid-002');
    assert.equal(result.totalBlocks, 2);
    assert.equal(result.blocks.length, 2);
  });

  it('3. Menghasilkan nilai 0 jika tidak ada bloks_count dan blocks kosong', () => {
    const rawKebun: KebunBackend = {
      id_kebun: 'kebun-uuid-003',
      tenant_id: 'tenant-01',
      nama_kebun: 'Kebun Baru Tanpa Blok',
      lokasi_kebun: null,
      url_foto: null,
      status_kebun: 'inaktif',
    };

    const result = mapKebunToFarmItem(rawKebun, []);
    assert.equal(result.totalBlocks, 0);
    assert.equal(result.status, 'Inaktif');
    assert.equal(result.location, 'Lokasi belum diatur');
  });

  it('4. Mengutamakan bloks_count dari backend di atas blocks.length jika keduanya tersedia', () => {
    const rawKebun: KebunBackend = {
      id_kebun: 'kebun-uuid-004',
      tenant_id: 'tenant-01',
      nama_kebun: 'Kebun Sinkronisasi Parsial',
      lokasi_kebun: 'Kec. Rogojampi, Banyuwangi',
      url_foto: null,
      status_kebun: 'aktif',
      bloks_count: 12,
    };

    // Array blocks lokal hanya membawa 1 blok, namun bloks_count adalah 12
    const result = mapKebunToFarmItem(rawKebun, [dummyBlockA]);
    assert.equal(result.totalBlocks, 12);
    assert.equal(result.blocks.length, 1);
  });
});

