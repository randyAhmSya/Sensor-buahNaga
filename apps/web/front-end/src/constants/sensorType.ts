/**
 * Konstanta dan tipe resmi untuk jenis sensor IoT AgroLight.
 * Sesuai aturan backend: hanya 'lux_suhu' atau 'cahaya' yang sah (selain itu HTTP 422).
 */

export const VALID_SENSOR_TYPES = ['lux_suhu', 'cahaya'] as const;

export type SensorType = (typeof VALID_SENSOR_TYPES)[number];

export const DEFAULT_SENSOR_TYPE: SensorType = 'lux_suhu';

export const SENSOR_TYPE_LABELS: Record<SensorType, string> = {
  lux_suhu: 'Sensor Cahaya & Suhu (lux_suhu)',
  cahaya: 'Sensor Cahaya (lux)',
};

export interface SensorTypeOption {
  value: SensorType;
  label: string;
}

export const SENSOR_TYPE_OPTIONS: readonly SensorTypeOption[] = [
  { value: 'lux_suhu', label: SENSOR_TYPE_LABELS.lux_suhu },
  { value: 'cahaya', label: SENSOR_TYPE_LABELS.cahaya },
];

/**
 * Normalisasi tipe sensor agar selalu menghasilkan SensorType yang sah:
 * - 'cahaya', 'cahaya_lux', 'lux' dinormalisasi ke 'cahaya'
 * - 'lux_suhu', 'Lux & Temp Sensor' dinormalisasi ke 'lux_suhu'
 * - selain itu (suhu, kelembapan, string acak, null, undefined, bukan string) dinormalisasi ke 'lux_suhu'
 */
export function normalizeSensorType(raw: unknown): SensorType {
  if (typeof raw !== 'string') {
    return DEFAULT_SENSOR_TYPE;
  }

  const clean = raw.trim();

  // Kasus variasi sensor cahaya
  if (clean === 'cahaya' || clean === 'cahaya_lux' || clean === 'lux') {
    return 'cahaya';
  }

  // Kasus variasi sensor cahaya dan suhu
  if (clean === 'lux_suhu' || clean === 'Lux & Temp Sensor') {
    return 'lux_suhu';
  }

  // Fallback pengaman untuk nilai legasi atau tidak sah lainnya
  return DEFAULT_SENSOR_TYPE;
}

