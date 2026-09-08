import { memo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface DashboardMetricCardProps {
  title: string
  value: string | number
  unit?: string
  unitColor?: string
  icon: LucideIcon
  iconBgColor?: string
  iconColor: string
  badgeText?: string
  badgeVariant?: 'rose' | 'emerald' | 'amber' | 'slate'
}

export const DashboardMetricCard = memo<DashboardMetricCardProps>(({
  title,
  value,
  unit,
  unitColor = 'text-slate-500',
  icon: Icon,
  iconColor,
  badgeText,
  badgeVariant = 'rose',
}) => {
  const badgeStyles = {
    rose: 'text-rose-600 bg-white border border-rose-400',
    emerald: 'text-emerald-700 bg-white border border-emerald-400',
    amber: 'text-amber-700 bg-white border border-amber-400',
    slate: 'text-slate-700 bg-white border border-slate-300',
  }

  return (
    <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs transition-all duration-150 hover:shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 bg-white border border-slate-200 shadow-2xs ${iconColor} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {badgeText && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border shadow-2xs ${badgeStyles[badgeVariant]}`}>
            {badgeText}
          </span>
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-900">
        {value} {unit && <span className={`text-sm font-normal ${unitColor}`}>{unit}</span>}
      </h3>
    </Card>
  )
})

DashboardMetricCard.displayName = 'DashboardMetricCard'
