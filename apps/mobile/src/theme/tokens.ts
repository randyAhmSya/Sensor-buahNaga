/**
 * Design Tokens Terpusat AgroLight Mobile.
 * Satu sumber kebenaran untuk skala radius dan palet status solid high-contrast.
 */

export const radius = {
  /** Radius kartu hampir kotak (8px / rounded-lg) */
  card: 8,
  /** Radius kontrol tombol, input, dan kotak filter (8px / rounded-lg) */
  control: 8,
  /** Radius tag, pill, dan badge seragam (6px / rounded-md) */
  tag: 6,
  /** Radius sudut atas modal / bottom sheet (12px / rounded-t-xl) */
  sheet: 12,
  /** Radius bulat penuh khusus avatar & ikon lingkaran (9999px / rounded-full) */
  full: 9999,
} as const;

export const border = {
  /** Border tegas 1.5px pengganti elemen yang tadinya memiliki latar tint */
  strong: 1.5,
  /** Border standar 1px */
  default: 1,
} as const;

export const borderColors = {
  success: "#047857",
  danger: "#DC2626",
  warning: "#D97706",
  neutral: "#94A3B8", // Slate-400 tegas
  info: "#2563EB",
  card: "#E2E8F0", // Slate-200 untuk border kartu 1px
} as const;

export const iconColors = {
  neutral: "#334155", // Slate-700 untuk seluruh ikon wadah & konten standar
  muted: "#475569",   // Slate-600 untuk metadata sekunder (lokasi, jam)
  subtle: "#64748B",  // Slate-500 untuk chevron navigasi
  inverse: "#FFFFFF", // Putih solid
  hero: "#A7F3D0",    // Emerald-200 untuk ikon dalam hero banner
} as const;

export const heroColors = {
  bg: "#064E3B",         // Solid dark emerald
  border: "#047857",     // Border tegas emerald
  cardBg: "#065F46",     // Solid medium emerald untuk kotak metrik
  cardBorder: "#047857", // Border kotak metrik hero
  icon: "#A7F3D0",       // Emerald-200
  textAccent: "#A7F3D0", // Teks identitas lahan & aksen hero
} as const;

export const textColors = {
  primary: "#0F172A",   // Slate-900
  secondary: "#334155", // Slate-700
  muted: "#475569",     // Slate-600
  subtle: "#64748B",    // Slate-500
  inverse: "#FFFFFF",
} as const;

export type BadgeTone = "success" | "danger" | "warning" | "neutral" | "info";

export interface StatusColorStyle {
  bg: string;
  text: string;
  border: string;
}

/**
 * Palet warna status solid penuh (tanpa opacity / alpha).
 * Seluruh kombinasi teks terhadap latar telah diverifikasi memenuhi rasio kontras WCAG >= 4.5:1.
 */
export const statusColors: Record<BadgeTone, StatusColorStyle> = {
  // Online / Berhasil / Aktif / Auto-dimming (Kontras 5.48:1)
  success: {
    bg: "#047857",
    text: "#FFFFFF",
    border: "#065F46",
  },
  // Offline / Gagal / Bahaya / Terputus (Kontras 4.83:1)
  danger: {
    bg: "#DC2626",
    text: "#FFFFFF",
    border: "#B91C1C",
  },
  // Peringatan / Menunggu (Teks Slate-900 kontras tinggi 8.31:1)
  warning: {
    bg: "#F59E0B",
    text: "#0F172A",
    border: "#D97706",
  },
  // Belum Pernah Terlihat / Nonaktif / Netral (Kontras 7.58:1)
  neutral: {
    bg: "#475569",
    text: "#FFFFFF",
    border: "#334155",
  },
  // Info / Mode Manual / Siklus Selesai (Kontras 5.17:1)
  info: {
    bg: "#2563EB",
    text: "#FFFFFF",
    border: "#1D4ED8",
  },
};

export const colors = {
  status: statusColors,
  border: borderColors,
  icon: iconColors,
  hero: heroColors,
  text: textColors,
} as const;
