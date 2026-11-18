/**
 * Shared styling tokens and button variants for landing pages
 */

export const LANDING_BUTTONS = {
  // Tombol utama di area terang (latar putih atau slate-50)
  primaryLight:
    'inline-flex items-center justify-center font-semibold bg-brand-700 hover:bg-brand-800 text-white rounded-xl shadow-xs transition-colors',

  // Tombol utama di area gelap (HeroSection, CtaBanner)
  primaryDark:
    'inline-flex items-center justify-center font-semibold bg-brand-500 hover:bg-brand-400 text-brand-950 rounded-xl shadow-md transition-colors',

  // Tombol sekunder di area terang
  secondaryLight:
    'group inline-flex items-center justify-center font-semibold bg-white hover:bg-brand-700 text-slate-900 hover:text-white border border-brand-600 hover:border-brand-700 rounded-xl shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',

  // Tombol sekunder di area gelap
  secondaryDark:
    'group inline-flex items-center justify-center font-medium bg-transparent hover:bg-brand-500 text-white hover:text-brand-950 border border-brand-400/60 hover:border-brand-500 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
} as const

export const LANDING_STYLES = {
  // Alias tombol sekunder
  secondaryLight: LANDING_BUTTONS.secondaryLight,
  secondaryDark: LANDING_BUTTONS.secondaryDark,

  // Panah tombol sekunder
  secondaryArrow: 'w-4 h-4 text-brand-700 group-hover:text-white transition-colors',

  // Eyebrow label kecil
  eyebrow: 'text-xs font-bold uppercase tracking-wider text-brand-700',

  // Wadah ikon di area terang: putih dengan bayangan lembut tanpa border
  iconContainer:
    'h-11 w-11 rounded-xl bg-white text-brand-700 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(15,23,42,0.10)]',

  // Wadah ikon di area gelap
  iconContainerDark:
    'h-11 w-11 rounded-xl bg-white/5 text-brand-400 flex items-center justify-center shrink-0 shadow-sm',

  // Ukuran ikon standar
  icon: 'w-5 h-5',

  // Chip dan badge di area terang: transparan dengan border lembut
  badge:
    'text-xs font-semibold px-3 py-1 rounded-full bg-transparent border border-brand-600/30 text-brand-700 inline-flex items-center',

  // Badge khusus kartu populer harga
  badgePopular:
    'text-xs font-bold px-3 py-1 rounded-full bg-transparent border border-brand-600/50 text-brand-700 inline-flex items-center uppercase tracking-wider',

  // Chip dan badge di area gelap
  badgeDark:
    'text-xs font-semibold px-3 py-1 rounded-full bg-transparent border border-brand-400/30 text-brand-300 inline-flex items-center',
} as const
