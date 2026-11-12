import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { GatewayBackend } from '../../../types/gateway.types.ts';
import { KODE_PERANGKAT_REGEX } from '../../../schemas/deviceCode.schema.ts';
import {
  buildGatewayCode,
  resolveKebunGateway,
  mapCreateGatewayError,
  mapCreateNodeError,
  mapUpdateNodeError,
  isKebunAlreadyHasGatewayError,
} from './kebunGateway.ts';

describe('kebunGateway.ts - Utilitas Gateway Kebun & Pemetaan Error', () => {
  describe('buildGatewayCode - Pembentukan Kode Gateway Otomatis', () => {
    it('1. Membentuk kode gateway dengan panjang input 3 karakter', () => {
      const code = buildGatewayCode('ABC');
      assert.equal(code, 'GTW-ABC');
      assert.equal(code.length, 7);
      assert.equal(KODE_PERANGKAT_REGEX.test(code), true);
    });

    it('2. Membentuk kode gateway dengan panjang input 46 karakter (tepat 50 karakter total)', () => {
      const nodeCode = 'A'.repeat(46);
      const code = buildGatewayCode(nodeCode);
      assert.equal(code, `GTW-${nodeCode}`);
      assert.equal(code.length, 50);
      assert.equal(KODE_PERANGKAT_REGEX.test(code), true);
    });

    it('3. Memotong input 47 karakter agar total tetap maksimum 50 karakter', () => {
      const nodeCode = 'B'.repeat(47);
      const code = buildGatewayCode(nodeCode);
      assert.equal(code, `GTW-${'B'.repeat(46)}`);
      assert.equal(code.length, 50);
      assert.equal(KODE_PERANGKAT_REGEX.test(code), true);
    });

    it('4. Memotong input 50 karakter (maksimum node) agar total tetap maksimum 50 karakter', () => {
      const nodeCode = 'C'.repeat(50);
      const code = buildGatewayCode(nodeCode);
      assert.equal(code, `GTW-${'C'.repeat(46)}`);
      assert.equal(code.length, 50);
      assert.equal(KODE_PERANGKAT_REGEX.test(code), true);
    });

    it('5. Membersihkan karakter non-alfanumerik dan mengubah ke huruf besar', () => {
      const code = buildGatewayCode('node#01/sensor');
      assert.equal(code, 'GTW-NODE01SENSOR');
      assert.equal(KODE_PERANGKAT_REGEX.test(code), true);
    });
  });

  describe('resolveKebunGateway - Pemilihan Deterministik Gateway Kebun', () => {
    it('1. Mengembalikan null jika daftar gateway kosong', () => {
      assert.equal(resolveKebunGateway([], 'farm-1'), null);
    });

    it('2. Mengembalikan gateway tunggal yang cocok dengan kebunId atau farmBlocks', () => {
      const gw1: GatewayBackend = {
        id_gateway: 'gw-1',
        blok_id: 'block-1',
        kode_perangkat: 'GTW-01',
        status_koneksi: 'terhubung',
        blok: { nama_blok: 'Blok A', kebun_id: 'farm-1' },
      };
      assert.equal(resolveKebunGateway([gw1], 'farm-1'), gw1);
      assert.equal(resolveKebunGateway([gw1], undefined, ['block-1']), gw1);
    });

    it('3. Memilih gateway secara deterministik pada kebun yang memiliki lebih dari 1 gateway', () => {
      // Kasus: gw-connected vs gw-disconnected (utamakan yang terhubung)
      const gwDisconnected: GatewayBackend = {
        id_gateway: 'gw-disc',
        blok_id: 'block-1',
        kode_perangkat: 'GTW-OLD',
        status_koneksi: 'belum_terhubung',
        created_at: '2026-01-01T00:00:00Z',
        blok: { nama_blok: 'Blok A', kebun_id: 'farm-1' },
      };
      const gwConnected: GatewayBackend = {
        id_gateway: 'gw-conn',
        blok_id: 'block-2',
        kode_perangkat: 'GTW-ACTIVE',
        status_koneksi: 'terhubung',
        created_at: '2026-02-01T00:00:00Z',
        blok: { nama_blok: 'Blok B', kebun_id: 'farm-1' },
      };

      const resolved = resolveKebunGateway([gwDisconnected, gwConnected], 'farm-1');
      assert.equal(resolved?.id_gateway, 'gw-conn', 'Harus mengutamakan gateway yang terhubung');

      // Kasus: keduanya belum_terhubung, utamakan yang paling lama dibuat (earliest created_at)
      const gwOld: GatewayBackend = {
        id_gateway: 'gw-old',
        blok_id: 'block-1',
        kode_perangkat: 'GTW-01',
        status_koneksi: 'belum_terhubung',
        created_at: '2026-01-10T00:00:00Z',
        blok: { nama_blok: 'Blok A', kebun_id: 'farm-1' },
      };
      const gwNewer: GatewayBackend = {
        id_gateway: 'gw-newer',
        blok_id: 'block-2',
        kode_perangkat: 'GTW-02',
        status_koneksi: 'belum_terhubung',
        created_at: '2026-01-20T00:00:00Z',
        blok: { nama_blok: 'Blok B', kebun_id: 'farm-1' },
      };

      const resolvedOldest = resolveKebunGateway([gwNewer, gwOld], 'farm-1');
      assert.equal(resolvedOldest?.id_gateway, 'gw-old', 'Harus mengutamakan yang paling lama dibuat');
    });

    it('4. Mengembalikan null jika gateway bukan milik kebun bersangkutan', () => {
      const gwOther: GatewayBackend = {
        id_gateway: 'gw-other',
        blok_id: 'block-99',
        kode_perangkat: 'GTW-OTHER',
        status_koneksi: 'terhubung',
        blok: { nama_blok: 'Blok X', kebun_id: 'farm-other' },
      };
      assert.equal(resolveKebunGateway([gwOther], 'farm-1', ['block-1']), null);
    });
  });

  describe('Pemetaan Error & Deteksi Race Condition Balapan Gateway', () => {
    it('1. Mendeteksi galat 422 kebun sudah memiliki gateway', () => {
      const err = {
        status: 422,
        message: 'Kebun ini sudah memiliki gateway. Satu kebun hanya boleh punya satu gateway.',
      };
      assert.equal(isKebunAlreadyHasGatewayError(err), true);
      assert.equal(
        mapCreateGatewayError(err),
        'Kebun ini sudah memiliki gateway. Satu kebun hanya boleh punya satu gateway.'
      );
    });

    it('2. Memetakan error 422 format kode perangkat pada create gateway', () => {
      const err = {
        status: 422,
        errors: {
          kode_perangkat: ['Kode hanya boleh huruf, angka, strip, dan garis bawah (3 sampai 50 karakter).'],
        },
      };
      assert.equal(
        mapCreateGatewayError(err),
        'Kode hanya boleh huruf, angka, strip, dan garis bawah (3 sampai 50 karakter).'
      );
    });

    it('3. Memetakan error 422 GatewaySekebunDenganBlok pada create node', () => {
      const err = {
        status: 422,
        errors: {
          gateway_id: ['Gateway harus berasal dari kebun yang sama dengan blok node.'],
        },
      };
      assert.equal(
        mapCreateNodeError(err),
        'Gateway harus berasal dari kebun yang sama dengan blok node.'
      );
    });

    it('4. Memetakan error 403 kuota SaaS dan hak akses', () => {
      const err = { status: 403 };
      assert.equal(
        mapCreateNodeError(err, true),
        'Batas kuota perangkat sensor pada paket langganan Anda telah tercapai.'
      );
      assert.equal(
        mapCreateNodeError(err, false),
        'Anda tidak memiliki izin menambah sensor di area ini.'
      );
    });

    it('5. Memetakan error 422 pada update node', () => {
      const err = {
        status: 422,
        errors: {
          gateway_id: ['Gateway harus berasal dari kebun yang sama dengan blok node.'],
        },
      };
      assert.equal(
        mapUpdateNodeError(err),
        'Gateway harus berasal dari kebun yang sama dengan blok node.'
      );
    });
  });
});

