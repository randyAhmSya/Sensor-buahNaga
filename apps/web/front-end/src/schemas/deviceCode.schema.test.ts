import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  KODE_PERANGKAT_REGEX,
  KODE_PERANGKAT_ERROR_MESSAGE,
  kodePerangkatSchema,
  isValidKodePerangkat,
} from './deviceCode.schema.ts';

describe('deviceCode.schema - Validasi Kode Perangkat Bersama', () => {
  it('1. Menerima kode perangkat yang valid dengan panjang bervariasi', () => {
    const validCodes = [
      'ESP', // 3 karakter batas minimal
      'GTW-ESP32-01',
      'NODE_SENSOR_ALPHA',
      'ABCdef123_-',
      'A'.repeat(50), // 50 karakter batas maksimal
    ];

    for (const code of validCodes) {
      assert.equal(KODE_PERANGKAT_REGEX.test(code), true, `Gagal untuk kode: ${code}`);
      assert.equal(isValidKodePerangkat(code), true, `isValidKodePerangkat gagal untuk: ${code}`);

      const parseResult = kodePerangkatSchema.safeParse(code);
      assert.equal(parseResult.success, true, `safeParse gagal untuk: ${code}`);
      if (parseResult.success) {
        assert.equal(parseResult.data, code);
      }
    }
  });

  it('2. Menolak kode yang kurang dari 3 karakter atau lebih dari 50 karakter', () => {
    const invalidLengthCodes = [
      '',
      'A',
      'AB',
      'A'.repeat(51),
      'GTW-' + 'X'.repeat(47), // 51 karakter
    ];

    for (const code of invalidLengthCodes) {
      assert.equal(isValidKodePerangkat(code), false, `Harusnya invalid untuk: ${code}`);
      const parseResult = kodePerangkatSchema.safeParse(code);
      assert.equal(parseResult.success, false, `safeParse harusnya gagal untuk: ${code}`);
    }
  });

  it('3. Menolak kode yang mengandung karakter terlarang atau spasi (MQTT Broker Safety)', () => {
    const dangerousCodes = [
      'GTW 01', // spasi
      'GTW#01', // wildcard MQTT
      'GTW+01', // wildcard MQTT
      'GTW/01', // topik MQTT
      'GTW@01',
      'GTW$01',
      'GTW!01',
      'GTW.01',
      'NODE*01',
    ];

    for (const code of dangerousCodes) {
      assert.equal(isValidKodePerangkat(code), false, `Karakter terlarang lolos: ${code}`);
      const parseResult = kodePerangkatSchema.safeParse(code);
      assert.equal(parseResult.success, false, `Parsing sukses untuk karakter terlarang: ${code}`);
      if (!parseResult.success) {
        const hasExpectedMessage = parseResult.error.issues.some((issue) =>
          issue.message.includes(KODE_PERANGKAT_ERROR_MESSAGE)
        );
        assert.equal(
          hasExpectedMessage,
          true,
          `Pesan error tidak sesuai untuk kode ${code}: ${JSON.stringify(parseResult.error.issues)}`
        );
      }
    }
  });

  it('4. Menolak input script jahat (XSS Sanitization)', () => {
    const maliciousInputs = [
      '<script>alert(1)</script>',
      'javascript:void(0)',
      'GTW<script>',
    ];

    for (const input of maliciousInputs) {
      assert.equal(isValidKodePerangkat(input), false);
      const parseResult = kodePerangkatSchema.safeParse(input);
      assert.equal(parseResult.success, false);
    }
  });
});

