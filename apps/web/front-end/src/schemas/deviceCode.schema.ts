import { z } from 'zod';
import { antiScriptRefine } from '../utils/sanitize.ts';

/**
 * Format resmi kode perangkat (Gateway IoT dan Node Sensor):
 * - Panjang: 3 sampai 50 karakter
 * - Karakter yang diizinkan: huruf besar/kecil (A-Z, a-z), angka (0-9), strip (-), dan garis bawah (_)
 * - Karakter MQTT terlarang: spasi, #, +, /, @, $, dsb.
 */
export const KODE_PERANGKAT_REGEX = /^[A-Za-z0-9_-]{3,50}$/;

export const KODE_PERANGKAT_ERROR_MESSAGE =
  'Kode hanya boleh huruf, angka, strip, dan garis bawah (3 sampai 50 karakter).';

export const kodePerangkatSchema = antiScriptRefine(
  z
    .string({ message: 'Kode perangkat wajib diisi' })
    .trim()
    .min(1, 'Kode perangkat wajib diisi')
    .regex(KODE_PERANGKAT_REGEX, KODE_PERANGKAT_ERROR_MESSAGE)
);

/**
 * Helper validasi cepat boolean untuk kode perangkat
 */
export function isValidKodePerangkat(code: unknown): code is string {
  if (typeof code !== 'string') return false;
  const trimmed = code.trim();
  return KODE_PERANGKAT_REGEX.test(trimmed);
}
