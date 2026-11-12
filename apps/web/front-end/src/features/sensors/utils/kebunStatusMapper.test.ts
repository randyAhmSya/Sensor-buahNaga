import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapKebunStatusToBlockStatusMap } from './kebunStatusMapper.ts';
import type { BlokStatusLampuPerBlok } from '../../../types/block.types.ts';

describe('kebunStatusMapper - Pemetaan Status Lampu Kebun per blok_id', () => {
  it('1. Mengembalikan Map kosong bila input null, undefined, atau array kosong', () => {
    assert.equal(mapKebunStatusToBlockStatusMap(null).size, 0);
    assert.equal(mapKebunStatusToBlockStatusMap(undefined).size, 0);
    assert.equal(mapKebunStatusToBlockStatusMap([]).size, 0);
  });

  it('2. Berhasil memetakan status lampu per blok_id ke Map', () => {
    const rawStatus: BlokStatusLampuPerBlok[] = [
      {
        blok_id: 'blok-1',
        jumlah_node: 2,
        node_online: 1,
        node_offline: 1,
        jumlah_lampu: 10,
        jumlah_online: 5,
        jumlah_offline: 5,
        watt_terpasang: 500,
        batas_offline_detik: 90,
        nodes: [
          {
            id_sensor: 'sensor-1',
            kode_perangkat: 'NODE-01',
            status_online: true,
            status: 'online',
            terakhir_terlihat: '2026-11-12T04:00:00Z',
            jumlah_lampu: 5,
            watt_per_lampu: 50,
            watt_terpasang: 250,
          },
          {
            id_sensor: 'sensor-2',
            kode_perangkat: 'NODE-02',
            status_online: false,
            status: 'offline',
            terakhir_terlihat: '2026-11-11T12:00:00Z',
            jumlah_lampu: 5,
            watt_per_lampu: 50,
            watt_terpasang: 250,
          },
        ],
      },
      {
        blok_id: 'blok-2',
        jumlah_node: 0,
        node_online: 0,
        node_offline: 0,
        jumlah_lampu: 0,
        jumlah_online: 0,
        jumlah_offline: 0,
        watt_terpasang: null,
        batas_offline_detik: 90,
        nodes: [],
      },
    ];

    const map = mapKebunStatusToBlockStatusMap(rawStatus);
    assert.equal(map.size, 2);

    const b1 = map.get('blok-1');
    assert.ok(b1);
    assert.equal(b1.jumlah_lampu, 10);
    assert.equal(b1.node_online, 1);
    assert.equal(b1.nodes.length, 2);

    const b2 = map.get('blok-2');
    assert.ok(b2);
    assert.equal(b2.jumlah_lampu, 0);
    assert.equal(b2.nodes.length, 0);
  });

  it('3. Mengabaikan elemen yang tidak memiliki blok_id yang valid', () => {
    const rawStatus = [
      {
        blok_id: '',
        jumlah_lampu: 5,
        jumlah_online: 5,
        jumlah_offline: 0,
        batas_offline_detik: 90,
        nodes: [],
      },
      null,
    ] as unknown as BlokStatusLampuPerBlok[];

    const map = mapKebunStatusToBlockStatusMap(rawStatus);
    assert.equal(map.size, 0);
  });
});
