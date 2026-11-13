/**
 * Utility Pemformatan Daya Listrik (Watt) Terpusat AgroLight Mobile.
 *
 * Menggunakan pemformatan manual tanpa ketergantungan pada Intl atau toLocaleString
 * agar 100% konsisten dan deterministik di seluruh engine JavaScript termasuk Hermes.
 */

/**
 * Format daya dalam satuan Watt (contoh: "60 W", "60.5 W", atau "Daya belum diisi").
 * Nilai null atau string kosong tidak pernah dipaksa menjadi "0 W".
 */
export function formatWatt(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") {
    return "Daya belum diisi";
  }

  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num) || num < 0) {
    return "Daya belum diisi";
  }

  // Jika nilai bulat tampilkan tanpa desimal, jika pecahan batasi 2 desimal
  const formatted = num % 1 === 0 ? String(num) : String(Math.round(num * 100) / 100);
  return `${formatted} W`;
}

/**
 * Format total daya terpasang (contoh: "120 W terpasang" atau "Daya belum diisi").
 */
export function formatWattTerpasang(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") {
    return "Daya belum diisi";
  }

  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num) || num < 0) {
    return "Daya belum diisi";
  }

  const formatted = num % 1 === 0 ? String(num) : String(Math.round(num * 100) / 100);
  return `${formatted} W terpasang`;
}

