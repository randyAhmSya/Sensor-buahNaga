/**
 * Pengaturan polling data sensor. Ubah HANYA angka ini untuk
 * mengatur seberapa sering web mengambil data terbaru.
 * Disarankan 5_000 sampai 30_000 (5 sampai 30 detik). Jangan di bawah 5_000.
 */
export const POLLING_SENSOR_MS = 10_000

export const POLLING_SENSOR_OPTIONS = {
    // data dianggap segar separuh dari interval, supaya tiap siklus selalu mengambil ulang
    staleTime: Math.floor(POLLING_SENSOR_MS / 2),
    refetchInterval: POLLING_SENSOR_MS,
    // berhenti memanggil API saat tab tidak sedang dilihat
    refetchIntervalInBackground: false,
} as const