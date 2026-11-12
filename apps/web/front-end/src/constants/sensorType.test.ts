import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  VALID_SENSOR_TYPES,
  DEFAULT_SENSOR_TYPE,
  SENSOR_TYPE_LABELS,
  SENSOR_TYPE_OPTIONS,
  normalizeSensorType,
} from './sensorType.ts';

describe('sensorType - Sumber Tunggal Tipe Sensor', () => {
  it('1. Memverifikasi daftar sah hanya memuat lux_suhu dan cahaya', () => {
    assert.deepEqual(VALID_SENSOR_TYPES, ['lux_suhu', 'cahaya']);
    assert.equal(DEFAULT_SENSOR_TYPE, 'lux_suhu');
  });

  it('2. Memverifikasi label resmi Bahasa Indonesia', () => {
    assert.equal(SENSOR_TYPE_LABELS.lux_suhu, 'Sensor Cahaya & Suhu (lux_suhu)');
    assert.equal(SENSOR_TYPE_LABELS.cahaya, 'Sensor Cahaya (lux)');

    assert.equal(SENSOR_TYPE_OPTIONS.length, 2);
    assert.deepEqual(SENSOR_TYPE_OPTIONS[0], {
      value: 'lux_suhu',
      label: 'Sensor Cahaya & Suhu (lux_suhu)',
    });
    assert.deepEqual(SENSOR_TYPE_OPTIONS[1], {
      value: 'cahaya',
      label: 'Sensor Cahaya (lux)',
    });
  });

  describe('normalizeSensorType - Aturan Normalisasi', () => {
    it('normalisasi variasi sensor cahaya (cahaya, cahaya_lux, lux) menjadi cahaya', () => {
      assert.equal(normalizeSensorType('cahaya'), 'cahaya');
      assert.equal(normalizeSensorType('cahaya_lux'), 'cahaya');
      assert.equal(normalizeSensorType('lux'), 'cahaya');
      assert.equal(normalizeSensorType('  cahaya  '), 'cahaya');
      assert.equal(normalizeSensorType('  cahaya_lux  '), 'cahaya');
      assert.equal(normalizeSensorType('  lux  '), 'cahaya');
    });

    it('normalisasi variasi sensor cahaya dan suhu (lux_suhu, Lux & Temp Sensor) menjadi lux_suhu', () => {
      assert.equal(normalizeSensorType('lux_suhu'), 'lux_suhu');
      assert.equal(normalizeSensorType('Lux & Temp Sensor'), 'lux_suhu');
      assert.equal(normalizeSensorType('  lux_suhu  '), 'lux_suhu');
      assert.equal(normalizeSensorType('  Lux & Temp Sensor  '), 'lux_suhu');
    });

    it('normalisasi tipe legasi atau tidak sah (suhu, kelembapan, acak) menjadi lux_suhu', () => {
      assert.equal(normalizeSensorType('suhu'), 'lux_suhu');
      assert.equal(normalizeSensorType('kelembapan'), 'lux_suhu');
      assert.equal(normalizeSensorType('kelembaban'), 'lux_suhu');
      assert.equal(normalizeSensorType('sensor_tanah'), 'lux_suhu');
      assert.equal(normalizeSensorType('random_type'), 'lux_suhu');
      assert.equal(normalizeSensorType(''), 'lux_suhu');
      assert.equal(normalizeSensorType('   '), 'lux_suhu');
    });

    it('normalisasi nilai null, undefined, dan bukan string menjadi lux_suhu', () => {
      assert.equal(normalizeSensorType(null), 'lux_suhu');
      assert.equal(normalizeSensorType(undefined), 'lux_suhu');
      assert.equal(normalizeSensorType(123), 'lux_suhu');
      assert.equal(normalizeSensorType(true), 'lux_suhu');
      assert.equal(normalizeSensorType({}), 'lux_suhu');
      assert.equal(normalizeSensorType([]), 'lux_suhu');
    });
  });
});

