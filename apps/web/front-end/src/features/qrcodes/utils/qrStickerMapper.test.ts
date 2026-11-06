import test from 'node:test';
import assert from 'node:assert/strict';
import { mapNodeToRegisteredQR } from './qrStickerMapper.ts';
import type { NodeSensorBackend } from '@/types/node.types';

test('mapNodeToRegisteredQR - teks stiker sama persis dengan teks_kode_qr dari API', () => {
  const mockNode: NodeSensorBackend = {
    id_sensor: 'sensor-uuid-1',
    blok_id: 'blok-uuid-1',
    gateway_id: 'gateway-uuid-1',
    qr_id: '7f185876-7931-4275-a541-be5e91fadca3',
    kode_perangkat: 'SENS-BLOK-1',
    tipe_sensor: 'cahaya_lux',
    status_koneksi: 'online',
    terakhir_terlihat: '2026-11-04T08:00:00Z',
    blok: {
      id_blok: 'blok-uuid-1',
      nama_blok: 'Blok Barat 02',
      kebun: {
        id_kebun: 'kebun-uuid-99',
        nama_kebun: 'Kebun Testing',
      },
    },
    qr: {
      id_qr: '7f185876-7931-4275-a541-be5e91fadca3',
      teks_kode_qr: 'QR-NODE-MC41BR',
      status_qr: true,
    },
  };

  const result = mapNodeToRegisteredQR(mockNode);

  assert.strictEqual(result.qrCodeText, 'QR-NODE-MC41BR');
  assert.strictEqual(result.isPrintable, true);
  assert.strictEqual(result.farmName, 'Kebun Testing');
  assert.strictEqual(result.blockName, 'Blok Barat 02');
  assert.strictEqual(result.qrId, '7f185876-7931-4275-a541-be5e91fadca3');
  assert.strictEqual(result.status, true);
  assert.notStrictEqual(result.qrCodeText, 'QR-NODE-2BLOEF');
  assert.notStrictEqual(result.farmName, 'Kebun Buah Naga');
  assert.notStrictEqual(result.blockName, 'Blok A');
});

test('mapNodeToRegisteredQR - node tanpa QR menghasilkan "Belum Terdaftar" dan isPrintable false', () => {
  const mockNodeTanpaQr: NodeSensorBackend = {
    id_sensor: 'sensor-uuid-2',
    blok_id: 'blok-uuid-2',
    gateway_id: null,
    qr_id: null,
    kode_perangkat: 'SENS-BARU',
    tipe_sensor: 'cahaya_lux',
    status_koneksi: 'offline',
    terakhir_terlihat: null,
    blok: {
      id_blok: 'blok-uuid-2',
      nama_blok: 'Blok Timur 01',
      kebun: {
        id_kebun: 'kebun-uuid-10',
        nama_kebun: 'Kebun Organik Banyuwangi',
      },
    },
    qr: null,
  };

  const result = mapNodeToRegisteredQR(mockNodeTanpaQr);

  assert.strictEqual(result.qrCodeText, 'Belum Terdaftar');
  assert.strictEqual(result.isPrintable, false);
  assert.strictEqual(result.farmName, 'Kebun Organik Banyuwangi');
  assert.strictEqual(result.blockName, 'Blok Timur 01');
  assert.notStrictEqual(result.qrCodeText, 'QR-NODE-2BLOEF');
});

test('mapNodeToRegisteredQR - node dengan QR teks kosong menghasilkan "Belum Terdaftar"', () => {
  const mockNodeQrKosong: NodeSensorBackend = {
    id_sensor: 'sensor-uuid-3',
    blok_id: 'blok-uuid-3',
    gateway_id: null,
    qr_id: 'qr-uuid-empty',
    kode_perangkat: 'SENS-BLOK-3',
    tipe_sensor: 'cahaya_lux',
    status_koneksi: 'offline',
    terakhir_terlihat: null,
    qr: {
      id_qr: 'qr-uuid-empty',
      teks_kode_qr: '   ',
      status_qr: false,
    },
  };

  const result = mapNodeToRegisteredQR(mockNodeQrKosong);

  assert.strictEqual(result.qrCodeText, 'Belum Terdaftar');
  assert.strictEqual(result.isPrintable, false);
  assert.strictEqual(result.farmName, 'Kebun Tidak Diketahui');
  assert.strictEqual(result.blockName, 'Blok Tidak Diketahui');
  assert.notStrictEqual(result.farmName, 'Kebun Buah Naga');
  assert.notStrictEqual(result.blockName, 'Blok A');
});

test('mapNodeToRegisteredQR - resolusi nama kebun melalui farmNameResolver bila blok.kebun kosong', () => {
  const mockNodeTanpaRelasiKebun: NodeSensorBackend = {
    id_sensor: 'sensor-uuid-4',
    blok_id: 'blok-uuid-4',
    gateway_id: null,
    qr_id: 'qr-uuid-4',
    kode_perangkat: 'SENS-BLOK-4',
    tipe_sensor: 'cahaya_lux',
    status_koneksi: 'offline',
    terakhir_terlihat: null,
    blok: {
      id_blok: 'blok-uuid-4',
      nama_blok: 'Blok Sentral',
    },
    qr: {
      id_qr: 'qr-uuid-4',
      teks_kode_qr: 'QR-NODE-DYNAMIC-123',
      status_qr: true,
    },
  };

  const resolver = (blockId?: string | null) => {
    if (blockId === 'blok-uuid-4') return 'Kebun Riset Polije';
    return undefined;
  };

  const result = mapNodeToRegisteredQR(mockNodeTanpaRelasiKebun, resolver);

  assert.strictEqual(result.qrCodeText, 'QR-NODE-DYNAMIC-123');
  assert.strictEqual(result.isPrintable, true);
  assert.strictEqual(result.farmName, 'Kebun Riset Polije');
  assert.strictEqual(result.blockName, 'Blok Sentral');
  assert.notStrictEqual(result.farmName, 'Kebun Buah Naga');
});

