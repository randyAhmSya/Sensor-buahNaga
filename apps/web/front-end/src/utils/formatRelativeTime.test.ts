import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatRelativeTime } from './formatRelativeTime.ts';

describe('formatRelativeTime - Pemformat Waktu Relatif & Proteksi Timezone UTC Backend', () => {
  it('1. Mengembalikan penanda netral "--" bila tanggal kosong, null, undefined, atau invalid', () => {
    assert.equal(formatRelativeTime(undefined), '--');
    assert.equal(formatRelativeTime(null), '--');
    assert.equal(formatRelativeTime(''), '--');
    assert.equal(formatRelativeTime('   '), '--');
    assert.equal(formatRelativeTime('-'), '--');
    assert.equal(formatRelativeTime('--'), '--');
    assert.equal(formatRelativeTime('invalid-date-string'), '--');
  });

  it('2. Memproses string ISO UTC berakhiran Z secara tepat tanpa meleset 7 jam WIB', () => {
    // Waktu acuan tetap dalam UTC: 2026-11-07T06:05:00.000Z (Pukul 13:05 WIB)
    const fixedNowMs = new Date('2026-11-07T06:05:00.000Z').getTime();

    // Notifikasi dibuat 5 menit yang lalu di backend (2026-11-07T06:00:00.000Z)
    const isoUtcFiveMinutesAgo = '2026-11-07T06:00:00.000Z';
    const result5Min = formatRelativeTime(isoUtcFiveMinutesAgo, fixedNowMs);
    assert.equal(result5Min, '5 menit yang lalu', 'Wajib 5 menit yang lalu dan tidak boleh meleset 7 jam');

    // Notifikasi dibuat 30 detik yang lalu (2026-11-07T06:04:30.000Z)
    const isoUtcThirtySecondsAgo = '2026-11-07T06:04:30.000Z';
    const result30Sec = formatRelativeTime(isoUtcThirtySecondsAgo, fixedNowMs);
    assert.equal(result30Sec, 'Baru saja');

    // Notifikasi dibuat 2 jam yang lalu di backend (2026-11-07T04:05:00.000Z)
    const isoUtcTwoHoursAgo = '2026-11-07T04:05:00.000Z';
    const result2Hour = formatRelativeTime(isoUtcTwoHoursAgo, fixedNowMs);
    assert.equal(result2Hour, '2 jam yang lalu');

    // Notifikasi dibuat 3 hari yang lalu di backend (2026-11-04T06:05:00.000Z)
    const isoUtcThreeDaysAgo = '2026-11-04T06:05:00.000Z';
    const result3Days = formatRelativeTime(isoUtcThreeDaysAgo, fixedNowMs);
    assert.equal(result3Days, '3 hari yang lalu');
  });

  it('3. Menangani timestamp SQL tanpa timezone (YYYY-MM-DD HH:mm:ss)', () => {
    // Waktu acuan
    const fixedNowMs = new Date('2026-11-07T13:10:00').getTime();
    const sqlTimestamp = '2026-11-07 13:00:00';
    const result = formatRelativeTime(sqlTimestamp, fixedNowMs);
    assert.equal(result, '10 menit yang lalu');
  });

  it('4. Menangani selisih waktu jitter kecil di masa depan (< 60 detik) sebagai "Baru saja"', () => {
    const fixedNowMs = new Date('2026-11-07T06:00:00.000Z').getTime();
    // Jam backend 10 detik lebih cepat dari klien
    const futureIso = '2026-11-07T06:00:10.000Z';
    const result = formatRelativeTime(futureIso, fixedNowMs);
    assert.equal(result, 'Baru saja');
  });
});

