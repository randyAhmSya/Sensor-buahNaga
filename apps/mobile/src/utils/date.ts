/**
 * Utility Pemformatan Tanggal & Waktu Presisi Terpusat (WIB / Asia-Jakarta).
 *
 * Menggunakan aritmetika offset tetap +7 jam (UTC+7, tanpa DST) sebagai
 * implementasi utama yang deterministik di seluruh platform (Android, iOS, Hermes, Web).
 * Menghindari bug pelabelan jam UTC sebagai WIB dan ketidaktepatan batas pergantian hari.
 */

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const NAMA_BULAN_SINGKAT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

function pad2(num: number): string {
  return String(num).padStart(2, "0");
}

/**
 * Parsing input string atau Date dari database/backend UTC menjadi Date UTC valid.
 * Menangani string MySQL/PostgreSQL mentah tanpa zona ("YYYY-MM-DD HH:mm:ss")
 * dengan menambahkan suffix UTC "Z" agar tidak salah dianggap waktu lokal perangkat.
 */
export function parseUtcDate(
  input?: string | Date | number | null,
): Date | null {
  if (input === null || input === undefined) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  const trimmed = input.trim();
  if (trimmed === "") return null;

  // Jika string MySQL/PostgreSQL tanpa offset (contoh: "2026-11-03 22:47:00" atau "2026-11-03T22:47:00")
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)) {
    const isoUtcString = trimmed.replace(" ", "T") + "Z";
    const parsed = new Date(isoUtcString);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Mengekstrak komponen tanggal dan waktu dalam zona WIB (UTC+7)
 * secara deterministik menggunakan fungsi UTC dari timestamp yang digeser.
 */
export function getWibDateParts(date: Date) {
  const wibTime = new Date(date.getTime() + WIB_OFFSET_MS);
  return {
    year: wibTime.getUTCFullYear(),
    month: wibTime.getUTCMonth(),
    day: wibTime.getUTCDate(),
    hours: wibTime.getUTCHours(),
    minutes: wibTime.getUTCMinutes(),
    seconds: wibTime.getUTCSeconds(),
    dayOfWeek: wibTime.getUTCDay(),
  };
}

/**
 * Format jam dan menit dengan penanda WIB (contoh: "05.47 WIB").
 */
export function formatJamWib(dateInput?: string | Date | number | null): string {
  const d = parseUtcDate(dateInput);
  if (!d) return "Belum ada data";

  const { hours, minutes } = getWibDateParts(d);
  const formatted = `${pad2(hours)}.${pad2(minutes)} WIB`;

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    // Log dev untuk verifikasi di ponsel fisik melalui terminal Metro
    console.log(`[WIB-TimeCheck] Input: ${String(dateInput)} -> WIB: ${formatted}`);
  }

  return formatted;
}

/**
 * Menghitung selisih hari kalender kalender murni di zona waktu WIB.
 * 0 = Hari ini, 1 = Kemarin, dst.
 */
export function getSelisihHariKalenderWib(targetDate: Date, nowDate: Date = new Date()): number {
  const targetEpochDays = Math.floor((targetDate.getTime() + WIB_OFFSET_MS) / MS_PER_DAY);
  const nowEpochDays = Math.floor((nowDate.getTime() + WIB_OFFSET_MS) / MS_PER_DAY);
  return nowEpochDays - targetEpochDays;
}

/**
 * Format pengelompokan tanggal untuk daftar pemantauan node.
 * Contoh: "Hari Ini, 4 November 2026", "Kemarin, 3 November 2026", "2 November 2026".
 */
export function formatTanggalGrupWib(
  dateInput?: string | Date | number | null,
  nowOverride?: Date,
): string {
  const d = parseUtcDate(dateInput);
  if (!d) return "Belum Ada Data";

  const selisihHari = getSelisihHariKalenderWib(d, nowOverride);
  const parts = getWibDateParts(d);
  const strTgl = `${parts.day} ${NAMA_BULAN[parts.month]} ${parts.year}`;

  if (typeof __DEV__ !== "undefined" && __DEV__) {
    console.log(
      `[WIB-GroupCheck] Input: ${String(dateInput)} -> Selisih: ${selisihHari} hari (WIB: ${parts.day}/${parts.month + 1}/${parts.year})`,
    );
  }

  if (selisihHari === 0) return `Hari Ini, ${strTgl}`;
  if (selisihHari === 1) return `Kemarin, ${strTgl}`;
  return strTgl;
}

/**
 * Format waktu relatif dari ISO string (contoh: "baru saja", "5 mnt lalu", "2 jam lalu").
 */
export function formatWaktuRelatifWib(
  dateInput?: string | Date | number | null,
): string {
  const d = parseUtcDate(dateInput);
  if (!d) return "Belum pernah mengirim data";

  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - d.getTime()) / 1000));

  if (diffSeconds < 60) {
    return "baru saja";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} mnt lalu`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} jam lalu`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} hari lalu`;
  }

  const { day, month, year } = getWibDateParts(d);
  return `${day} ${NAMA_BULAN_SINGKAT[month]} ${year}`;
}

/**
 * Format teks data basi untuk sensor telemetri.
 * Contoh: "Data terakhir 4 Nov, 05:47 WIB".
 */
export function formatWaktuBasiWib(dateInput?: string | Date | number | null): string {
  const d = parseUtcDate(dateInput);
  if (!d) return "Belum ada data";

  const { day, month, hours, minutes } = getWibDateParts(d);
  return `Data terakhir ${day} ${NAMA_BULAN_SINGKAT[month]}, ${pad2(hours)}:${pad2(minutes)} WIB`;
}

/**
 * Format jam dan menit singkat (contoh: "05:47") dari string waktu atau ISO string.
 */
export function formatJamMenitWib(timeOrIso?: string | null): string {
  if (!timeOrIso || timeOrIso.trim() === "") return "-";
  const trimmed = timeOrIso.trim();

  // Jika formatnya sudah berupa string jam "HH:mm" atau "HH:mm:ss"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.slice(0, 5);
  }

  const d = parseUtcDate(trimmed);
  if (!d) return trimmed;

  const { hours, minutes } = getWibDateParts(d);
  return `${pad2(hours)}:${pad2(minutes)}`;
}

/**
 * Format waktu lengkap dengan tanggal, jam, dan zona WIB.
 * Contoh: "4 Nov 2026, 05.47 WIB".
 */
export function formatWaktuLengkapWib(dateInput?: string | Date | number | null): string {
  const d = parseUtcDate(dateInput);
  if (!d) return "-";

  const { day, month, year, hours, minutes } = getWibDateParts(d);
  return `${day} ${NAMA_BULAN_SINGKAT[month]} ${year}, ${pad2(hours)}.${pad2(minutes)} WIB`;
}

// Kompatibilitas mundur dengan nama fungsi sebelumnya
export const formatWaktuRelatif = formatWaktuRelatifWib;
export const formatWaktuBasi = formatWaktuBasiWib;
export const formatJamMenit = formatJamMenitWib;
