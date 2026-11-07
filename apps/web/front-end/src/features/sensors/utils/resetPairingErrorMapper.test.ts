import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapResetPairingError } from './resetPairingErrorMapper.ts';

describe('resetPairingErrorMapper - Pemetaan Galat Reset Pairing Gateway', () => {
  it('1. Memetakan HTTP 403 Forbidden', () => {
    const error = { status: 403, message: 'Forbidden' };
    const result = mapResetPairingError(error);
    assert.equal(result, 'Anda tidak punya izin mereset gateway ini');
  });

  it('2. Memetakan HTTP 404 Not Found', () => {
    const error = { status: 404, message: 'Gateway not found' };
    const result = mapResetPairingError(error);
    assert.equal(result, 'Gateway tidak ditemukan');
  });

  it('3. Memetakan HTTP 402 Payment Required (Langganan Habis)', () => {
    const error = { status: 402, message: 'Subscription expired' };
    const result = mapResetPairingError(error);
    assert.equal(
      result,
      'Masa aktif langganan Anda telah habis. Silakan perpanjang paket langganan Anda.'
    );
  });

  it('4. Memetakan HTTP 401 Unauthorized', () => {
    const error = { status: 401, message: 'Unauthenticated' };
    const result = mapResetPairingError(error);
    assert.equal(result, 'Sesi login telah kedaluwarsa. Silakan masuk kembali.');
  });

  it('5. Memetakan HTTP 408 Timeout', () => {
    const error = { status: 408, message: 'Request timeout' };
    const result = mapResetPairingError(error);
    assert.equal(result, 'Koneksi timeout, server tidak merespons tepat waktu.');
  });

  it('6. Memetakan HTTP 400 Bad Request', () => {
    const error = { status: 400, message: 'Invalid ID' };
    const result = mapResetPairingError(error);
    assert.equal(result, 'ID gateway tidak valid atau permintaan tidak lengkap.');
  });

  it('7. Memetakan error generik tanpa status atau string error', () => {
    assert.equal(
      mapResetPairingError(new Error('Network error')),
      'Gagal mereset pairing gateway. Silakan coba beberapa saat lagi.'
    );
    assert.equal(
      mapResetPairingError('Unknown error'),
      'Gagal mereset pairing gateway. Silakan coba beberapa saat lagi.'
    );
    assert.equal(
      mapResetPairingError(null),
      'Gagal mereset pairing gateway. Silakan coba beberapa saat lagi.'
    );
    assert.equal(
      mapResetPairingError(undefined),
      'Gagal mereset pairing gateway. Silakan coba beberapa saat lagi.'
    );
  });
});

