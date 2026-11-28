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
  /** Radius kartu kaca di layar Home (20px) */
  glass: 20,
  /** Radius kartu hero Home (24px) */
  hero: 24,
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
  muted: "#475569", // Slate-600 untuk metadata sekunder (lokasi, jam)
  subtle: "#64748B", // Slate-500 untuk chevron navigasi
  inverse: "#FFFFFF", // Putih solid
  hero: "#A7F3D0", // Emerald-200 untuk ikon dalam hero banner
} as const;

export const heroColors = {
  bg: "#064E3B", // Solid dark emerald
  border: "#047857", // Border tegas emerald
  cardBg: "#065F46", // Solid medium emerald untuk kotak metrik
  cardBorder: "#047857", // Border kotak metrik hero
  icon: "#A7F3D0", // Emerald-200
  textAccent: "#A7F3D0", // Teks identitas lahan & aksen hero
} as const;

/** Kartu "kaca": putih semi-transparan, garis tepi putih halus, bayangan lembut kehijauan. */
export const glassColors = {
  background: "rgba(255, 255, 255, 0.8)",
  border: "rgba(255, 255, 255, 0.95)",
  shadow: "0px 6px 20px rgba(6, 78, 59, 0.08)",
} as const;

/** Latar layar: gradasi hijau muda lembut ke abu-abu terang. */
export const screenBackground = {
  base: "#F8FAFC",
  gradient: ["#D1FAE5", "#ECFDF5", "#F8FAFC"],
  gradientLocations: [0, 0.3, 0.75],
} as const;

/** Hero Home: foto latar + lapisan hijau tua agar teks putih tetap terbaca. */
export const heroPhoto = {
  /** Lapisan hijau tipis (10%) di atas foto agar foto tetap terlihat. */
  overlay: ["rgba(4, 120, 87, 0.1)", "rgba(6, 78, 59, 0.1)"],
  shadow: "0px 10px 24px rgba(6, 78, 59, 0.28)",
  chipBg: "rgba(255, 255, 255, 0.16)",
  chipBorder: "rgba(255, 255, 255, 0.25)",
  tileBg: "rgba(255, 255, 255, 0.12)",
  tileBorder: "rgba(255, 255, 255, 0.22)",
  ringTrack: "rgba(255, 255, 255, 0.25)",
  ringProgress: "#6EE7B7",
  onlineDot: "#6EE7B7",
  offlineDot: "#FBBF24",
  label: "#D1FAE5",
} as const;

/** Warna ikon statistik (hanya ikon, tanpa latar). */
export const statIconColors = {
  kebun: "#047857",
  node: "#1D4ED8",
  siklus: "#B45309",
  lampu: "#B45309",
} as const;

/**
 * Aksen kartu status: garis tepi berwarna + bayangan sewarna (tanpa latar berwarna).
 * `border` memakai warna solid, `shadow` memakai warna yang sama dengan alpha.
 */
export const toneAccent: Record<
  BadgeTone,
  { border: string; shadow: string; dot: string }
> = {
  success: {
    border: "#10B981",
    shadow: "0px 3px 10px rgba(16, 185, 129, 0.28)",
    dot: "#10B981",
  },
  danger: {
    border: "#EF4444",
    shadow: "0px 3px 10px rgba(239, 68, 68, 0.28)",
    dot: "#EF4444",
  },
  warning: {
    border: "#F59E0B",
    shadow: "0px 3px 10px rgba(245, 158, 11, 0.3)",
    dot: "#F59E0B",
  },
  neutral: {
    border: "#94A3B8",
    shadow: "0px 3px 10px rgba(148, 163, 184, 0.3)",
    dot: "#94A3B8",
  },
  info: {
    border: "#3B82F6",
    shadow: "0px 3px 10px rgba(59, 130, 246, 0.28)",
    dot: "#3B82F6",
  },
};

/** Kapsul filter di Home (QuickActions) dan tombol aksi sekunder bergaya kaca. */
export const pillColors = {
  idleBg: "rgba(255, 255, 255, 0.85)",
  idleBorder: "rgba(255, 255, 255, 0.95)",
  idleShadow: "0px 2px 8px rgba(6, 78, 59, 0.08)",
  pressedBg: "#ECFDF5",
  pressedBorder: "#059669",
  activeShadow: "0px 4px 12px rgba(4, 120, 87, 0.3)",
} as const;

/** Tombol "Masuk dengan Google" dan elemen login lain. */
/** Tombol kembali tunggal. */
export const backButtonColors = {
  bg: "#F3F4F6",
  pressedBg: "#E5E7EB",
  icon: "#14532D",
} as const;

export const authColors = {
  googleRed: "#EA4335",
  buttonBg: "#FFFFFF",
  buttonBorder: "#CBD5E1",
  buttonShadow: "0px 1px 3px rgba(15, 23, 42, 0.12)",
  pressedBg: "#ECFDF5",
  pressedBorder: "#059669",
  ripple: "rgba(5, 150, 105, 0.15)",
  logoBg: "#ECFDF5",
  logoBorder: "#D1FAE5",
  logoInnerShadow: "inset 0px 2px 8px rgba(4, 120, 87, 0.18)",
} as const;

export const textColors = {
  primary: "#0F172A", // Slate-900
  secondary: "#334155", // Slate-700
  muted: "#475569", // Slate-600
  subtle: "#64748B", // Slate-500
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
  glass: glassColors,
  screen: screenBackground,
  heroPhoto,
  statIcon: statIconColors,
  tone: toneAccent,
  pill: pillColors,
  auth: authColors,
  backButton: backButtonColors,
} as const;
