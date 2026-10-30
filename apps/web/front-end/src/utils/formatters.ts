/**
 * Helper pemformat data numerik & tanggal untuk aplikasi AgroLight
 */

export function formatLux(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value) + ' Lux'
}

export function formatLuxHours(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value) + ' Lux-jam'
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDate(dateString?: string | null): string {
  return formatIndoDate(dateString, '-')
}

/**
 * Format tanggal ramah petani menggunakan standar bahasa Indonesia (contoh: 16 Okt 2026).
 * Mengabaikan ISO timestamp dan mengembalikan fallback strip netral jika data tidak tersedia.
 */
export function formatIndoDate(dateString?: string | null, fallback = '-'): string {
  if (!dateString) return fallback
  const trimmed = dateString.trim()
  if (!trimmed || trimmed === '-' || trimmed === '--' || trimmed === 'null' || trimmed === 'undefined') {
    return fallback
  }
  if (trimmed.toLowerCase().startsWith('belum')) {
    return trimmed
  }
  const date = new Date(trimmed)
  if (isNaN(date.getTime())) return fallback
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatTemperature(celcius: number): string {
  return `${celcius.toFixed(1)} °C`
}

export function formatVoltage(volt: number): string {
  return `${volt.toFixed(2)} V`
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
