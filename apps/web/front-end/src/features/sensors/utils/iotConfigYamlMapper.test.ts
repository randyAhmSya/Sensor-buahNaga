import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateFullIotYaml,
  generateItemDeviceYaml,
  getGatewayPairingState,
  resolvePetaniBaseUrl,
  type SensorDeviceConfigData,
} from './iotConfigYamlMapper.ts';

describe('iotConfigYamlMapper - Pembentuk Konfigurasi YAML IoT', () => {
  it('1. Kasus gateway ada dan pairing aktif', () => {
    const config: SensorDeviceConfigData = {
      nama: 'Blok A',
      sensor_id: '6f2a8932-d1d7-4ea2-9443-4c9c1e15e8b1',
      kode_node: 'ESP32-01',
      kode_gateway: 'GTW-ESP32-01',
      kode_pairing: 'PAIR-4N81KD',
      base_url: 'http://localhost:8000/api',
    };

    const pairingState = getGatewayPairingState(config.kode_gateway, config.kode_pairing);
    assert.equal(pairingState, 'menunggu_pairing');

    const itemYaml = generateItemDeviceYaml(config);
    assert.match(itemYaml, /nama: "Blok A"/);
    assert.match(itemYaml, /sensor_id: "6f2a8932-d1d7-4ea2-9443-4c9c1e15e8b1"/);
    assert.match(itemYaml, /kode_perangkat: "GTW-ESP32-01"/);
    assert.match(itemYaml, /kode_pairing: "PAIR-4N81KD"/);
    assert.match(itemYaml, /token_gateway: "" # Disimpan aman di server/);

    const fullYaml = generateFullIotYaml(config);
    assert.match(fullYaml, /base_url: http:\/\/localhost:8000\/api\/petani/);
    assert.match(fullYaml, /kode_perangkat: "GTW-ESP32-01"/);
    assert.match(fullYaml, /kode_pairing: "PAIR-4N81KD"/);
  });

  it('2. Kasus gateway ada dan sudah dipasangkan (kode_pairing null)', () => {
    const config: SensorDeviceConfigData = {
      nama: 'Blok B',
      sensor_id: '8a1b2c3d-1111-2222-3333-444455556666',
      kode_node: 'NODE-02',
      kode_gateway: 'GTW-NODE-02',
      kode_pairing: null,
      base_url: 'http://localhost:8000/api/petani',
    };

    const pairingState = getGatewayPairingState(config.kode_gateway, config.kode_pairing);
    assert.equal(pairingState, 'sudah_dipasangkan');

    const itemYaml = generateItemDeviceYaml(config);
    assert.match(itemYaml, /kode_perangkat: "GTW-NODE-02"/);
    assert.match(
      itemYaml,
      /kode_pairing: "" # Gateway sudah dipasangkan\. Gunakan token yang dicetak perangkat saat pairing\. Jika hilang, pairing perlu direset\./
    );

    const fullYaml = generateFullIotYaml(config);
    assert.match(fullYaml, /base_url: http:\/\/localhost:8000\/api\/petani/);
    assert.match(fullYaml, /kode_perangkat: "GTW-NODE-02"/);
  });

  it('3. Kasus gateway kosong (belum terhubung ke gateway)', () => {
    const config: SensorDeviceConfigData = {
      nama: 'Blok C',
      sensor_id: '9c8b7a6d-9999-8888-7777-666655554444',
      kode_node: 'NODE-03',
      kode_gateway: null,
      kode_pairing: null,
      base_url: 'http://localhost:8000/api',
    };

    const pairingState = getGatewayPairingState(config.kode_gateway, config.kode_pairing);
    assert.equal(pairingState, 'tanpa_gateway');

    const itemYaml = generateItemDeviceYaml(config);
    assert.match(itemYaml, /kode_perangkat: "" # Belum terhubung ke gateway/);
    assert.match(itemYaml, /kode_pairing: "" # Tampil saat gateway dibuat/);

    const fullYaml = generateFullIotYaml(config);
    assert.match(fullYaml, /base_url: http:\/\/localhost:8000\/api\/petani/);
    assert.match(fullYaml, /kode_perangkat: "" # Belum terhubung ke gateway/);
  });

  it('4. Resolusi base_url ke endpoint /petani', () => {
    assert.equal(resolvePetaniBaseUrl('http://localhost:8000/api'), 'http://localhost:8000/api/petani');
    assert.equal(resolvePetaniBaseUrl('http://localhost:8000/api/'), 'http://localhost:8000/api/petani');
    assert.equal(resolvePetaniBaseUrl('http://localhost:8000/api/petani'), 'http://localhost:8000/api/petani');
    assert.equal(resolvePetaniBaseUrl('http://localhost:8000/api/petani/'), 'http://localhost:8000/api/petani');
    assert.equal(resolvePetaniBaseUrl('https://api.agrolight.id'), 'https://api.agrolight.id/petani');
  });

  it('5. Transisi konfigurasi YAML sebelum vs sesudah reset pairing gateway', () => {
    const configSebelumReset: SensorDeviceConfigData = {
      nama: 'Blok A',
      sensor_id: '6f2a8932-d1d7-4ea2-9443-4c9c1e15e8b1',
      kode_node: 'ESP32-01',
      kode_gateway: 'GTW-ESP32-01',
      kode_pairing: null, // Sudah dipasangkan
      base_url: 'http://localhost:8000/api/petani',
    };

    assert.equal(
      getGatewayPairingState(configSebelumReset.kode_gateway, configSebelumReset.kode_pairing),
      'sudah_dipasangkan'
    );
    const yamlSebelum = generateItemDeviceYaml(configSebelumReset);
    assert.match(yamlSebelum, /Gateway sudah dipasangkan/);
    assert.doesNotMatch(yamlSebelum, /PAIR-/);

    // Setelah reset berhasil, kode_pairing baru diterbitkan oleh backend
    const configSesudahReset: SensorDeviceConfigData = {
      ...configSebelumReset,
      kode_pairing: 'PAIR-RESET99', // Kode pairing baru hasil reset
    };

    assert.equal(
      getGatewayPairingState(configSesudahReset.kode_gateway, configSesudahReset.kode_pairing),
      'menunggu_pairing'
    );
    const yamlSesudah = generateItemDeviceYaml(configSesudahReset);
    assert.match(yamlSesudah, /kode_pairing: "PAIR-RESET99"/);
    assert.doesNotMatch(yamlSesudah, /Gateway sudah dipasangkan/);
  });
});

