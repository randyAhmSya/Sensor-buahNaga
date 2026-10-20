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
  iconColor?: string
  badgeText?: string
  badgeVariant?: 'rose' | 'emerald' | 'amber' | 'slate'
}

export const DashboardMetricCard = memo<DashboardMetricCardProps>(({
  title,
  value,
  unit,
  unitColor = 'text-slate-500',
  icon: Icon,
}) => {
  return (
    <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs transition-all duration-150 hover:shadow-xs space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{title}</span>
        <Icon className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
        {value} {unit && <span className={`text-sm font-normal ${unitColor}`}>{unit}</span>}
      </div>
    </Card>
  )
})

DashboardMetricCard.displayName = 'DashboardMetricCard'
