import type { FC } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface MetricStatCardProps {
  title: string
  value: string | number
  unit?: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  iconBgColor?: string
  trend?: {
    value: string | number
    isPositive?: boolean
    label?: string
  }
  badge?: {
    label: string
    variant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'blue'
  }
  colorVariant?: 'default' | 'emerald' | 'amber' | 'rose' | 'blue'
  className?: string
  onClick?: () => void
}

const COLOR_VARIANTS: Record<string, { border: string; bg: string; iconBg: string; iconColor: string }> = {
  default: {
    border: 'border-slate-200/90',
    bg: 'bg-white',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
  },
  emerald: {
    border: 'border-emerald-200/90',
    bg: 'bg-emerald-50/30',
    iconBg: 'bg-emerald-100/80',
    iconColor: 'text-emerald-700',
  },
  amber: {
    border: 'border-amber-200/90',
    bg: 'bg-amber-50/30',
    iconBg: 'bg-amber-100/80',
    iconColor: 'text-amber-700',
  },
  rose: {
    border: 'border-rose-200/90',
    bg: 'bg-rose-50/30',
    iconBg: 'bg-rose-100/80',
    iconColor: 'text-rose-700',
  },
  blue: {
    border: 'border-sky-200/90',
    bg: 'bg-sky-50/30',
    iconBg: 'bg-sky-100/80',
    iconColor: 'text-sky-700',
  },
}

const BADGE_VARIANTS: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  amber: 'bg-amber-50 text-amber-800 border-amber-300',
  rose: 'bg-rose-50 text-rose-800 border-rose-300',
  slate: 'bg-slate-100 text-slate-700 border-slate-300',
  blue: 'bg-sky-50 text-sky-800 border-sky-300',
}

export const MetricStatCard: FC<MetricStatCardProps> = ({
  title,
  value,
  unit,
  description,
  icon: Icon,
  trend,
  badge,
  colorVariant = 'default',
  className = '',
  onClick,
}) => {
  const variant = COLOR_VARIANTS[colorVariant] || COLOR_VARIANTS.default
  const isClickable = Boolean(onClick)

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick?.() : undefined}
      className={`
        relative rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all duration-150
        ${variant.bg} ${variant.border}
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-slate-300 active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Konten Kiri: Label & Angka Metrik */}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-slate-600 truncate">{title}</p>
          
          <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-xs sm:text-sm font-semibold text-slate-500">
                {unit}
              </span>
            )}
          </div>

          {/* Deskripsi atau Trend */}
          {(description || trend) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {trend && (
                <span
                  className={`inline-flex items-center text-xs font-bold ${
                    trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}
                  {trend.label && <span className="font-normal text-slate-500 ml-1">({trend.label})</span>}
                </span>
              )}
              {description && (
                <p className="text-xs text-slate-500 line-clamp-1">{description}</p>
              )}
            </div>
          )}
        </div>

        {/* Konten Kanan: Badge & Icon */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {Icon && (
            <Icon className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          )}
          {badge && (
            <span
              className={`
                px-2 py-0.5 text-[11px] font-bold rounded-md border
                ${BADGE_VARIANTS[badge.variant || 'slate']}
              `}
            >
              {badge.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
