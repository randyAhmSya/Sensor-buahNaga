import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapNodeToSensorItem } from './sensorMapper.ts';

describe('sensorMapper - Pemetaan Data Node Sensor & Telemetri Riil', () => {
  it('1. Memetakan bacaan telemetri riil dari respons dashboard', () => {
    const node = {
      id_sensor: 'sensor-uuid-001',
      kode_perangkat: 'ND-B1-01',
      status_koneksi: 'aktif',
      blok: {
        id_blok: 'blok-1',
        nama_blok: 'Blok Barat',
        kebun_id: 'kebun-1',
        kebun: {
          id_kebun: 'kebun-1',
          nama_kebun: 'Kebun Rembang',
        },
      },
      jumlah_lampu: 4,
      watt_per_lampu: 50,
    };

    const reading = {
      nilai_lux: 175.5,
      suhu: 29.2,
      dicatat_pada: '2026-11-07T08:30:00.000Z',
    };

    const result = mapNodeToSensorItem(node, undefined, reading);

    assert.equal(result.nodeCode, 'ND-B1-01');
    assert.equal(result.luxLevel, 175.5);
    assert.equal(result.temperature, 29.2);
    assert.equal(result.status, 'Aktif');
    assert.equal(result.farmName, 'Kebun Rembang');
    assert.deepEqual(result.sparklineData, []);
    assert.equal(result.watt_terpasang, 200);
  });

  it('2. Tidak mengarang data (lux & suhu bernilai null bila belum ada pembacaan telemetri)', () => {
    const node = {
      id_sensor: 'sensor-uuid-002',
      kode_perangkat: 'ND-B1-02',
      status_koneksi: 'aktif',
      blok: {
        id_blok: 'blok-1',
        nama_blok: 'Blok Barat',
      },
    };

    // Tanpa reading
    const result = mapNodeToSensorItem(node, undefined, null);

    // Wajib null, BUKAN 120 lx dan BUKAN 28.5 C
    assert.equal(result.luxLevel, null);
    assert.equal(result.temperature, null);
    assert.deepEqual(result.sparklineData, []);
  });

  it('3. Tidak mengarang nama kebun jika data kebun kosong di backend', () => {
    const node = {
      id_sensor: 'sensor-uuid-003',
      kode_perangkat: 'ND-B1-03',
      status_koneksi: 'nonaktif',
      terakhir_terlihat: '2026-11-06T12:00:00.000Z',
    };

    const result = mapNodeToSensorItem(node);

    // Wajib string kosong atau sesuai input, BUKAN 'Kebun Buah Naga'
    assert.equal(result.farmName, '');
    assert.notEqual(result.farmName, 'Kebun Buah Naga');
    assert.equal(result.status, 'Nonaktif');
  });

  it('4. Menangani node yang belum pernah terhubung', () => {
    const node = {
      id_sensor: 'sensor-uuid-004',
      kode_perangkat: 'ND-B1-04',
      status_koneksi: 'belum_terhubung',
      terakhir_terlihat: null,
    };

    const result = mapNodeToSensorItem(node);

    assert.equal(result.status, 'belum_pernah_terlihat');
    assert.equal(result.lastSeen, 'Belum ada data');
  });
});

