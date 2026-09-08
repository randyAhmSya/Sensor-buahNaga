/**
 * Konstanta Global Aplikasi AgroLight
 */

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_KEBUN: 'ADMIN_KEBUN',
  PETANI: 'PETANI',
  AGRONOM: 'AGRONOM',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const ROLE_ADMIN = USER_ROLES.ADMIN_KEBUN
export const ROLE_PETANI = USER_ROLES.PETANI

// Ambang Batas Target Pencahayaan Buah Naga (Lux & Lux-Hours)
export const TARGET_LUX = {
  MIN_NIGHT_SUPPLEMENT: 70, // Lux minimal lampu malam
  OPTIMAL_NIGHT_SUPPLEMENT: 120, // Lux optimal induksi pembungaan
  DAILY_LUX_HOURS_TARGET: 14000, // Akumulasi lux-jam harian optimal
  SEASON_TARGET_LUX_HOURS: 420000, // Target kumulatif fase pembungaan s/d panen
} as const

// Status Perangkat IoT & Sensor
export const DEVICE_STATUS = {
  ONLINE: 'ONLINE',
  DEGRADED: 'DEGRADED',
  OFFLINE: 'OFFLINE',
} as const

export type DeviceStatus = (typeof DEVICE_STATUS)[keyof typeof DEVICE_STATUS]

// Status Pencetakan QR Tag
export const QR_PRINT_STATUS = {
  PRINTED: 'TERCETAK',
  PENDING: 'MENUNGGU_CETAK',
  FAILED: 'GAGAL',
} as const

export type QrPrintStatus = (typeof QR_PRINT_STATUS)[keyof typeof QR_PRINT_STATUS]

// Fase Pertumbuhan Buah Naga
export const HARVEST_PHASES = {
  VEGETATIVE: 'Fase Vegetatif',
  FLOWERING_INDUCTION: 'Fase Induksi Pembungaan',
  BUD_EMERGENCE: 'Muncul Tunas & Kuncup Bunga',
  FRUIT_DEVELOPMENT: 'Pembesaran Buah',
  RIPENING: 'Pematangan',
} as const

export type HarvestPhase = (typeof HARVEST_PHASES)[keyof typeof HARVEST_PHASES]
