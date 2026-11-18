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
    'inline-flex items-center justify-center font-semibold bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-xl shadow-xs transition-colors',

  // Tombol sekunder di area gelap
  secondaryDark:
    'inline-flex items-center justify-center font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-colors backdrop-blur-xs',
} as const

export const LANDING_STYLES = {
  eyebrow: 'text-xs font-bold uppercase tracking-wider text-brand-700',
  iconContainer: 'h-11 w-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0',
  icon: 'w-5 h-5',
  badge: 'text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 inline-flex items-center',
} as const
