import { memo } from 'react'
import { AlertTriangle, CalendarCheck } from 'lucide-react'

interface DashboardAlertBarProps {
  offlineCount?: number
  harvestEstimate?: string
}

export const DashboardAlertBar = memo<DashboardAlertBarProps>(({
  offlineCount = 3,
  harvestEstimate = 'Estimasi Panen Blok A: 24 Nov 2023 (Toleransi ±3 Hari)',
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {offlineCount > 0 && (
        <div className="inline-flex items-center gap-2 bg-white border border-rose-300 px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-700 shadow-2xs transition-all duration-150">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Perlu Tindakan: {offlineCount} Node Sensor Offline</span>
        </div>
      )}
      {harvestEstimate && (
        <div className="inline-flex items-center gap-2 bg-white border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-800 shadow-2xs transition-all duration-150">
          <CalendarCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{harvestEstimate}</span>
        </div>
      )}
    </div>
  )
})

DashboardAlertBar.displayName = 'DashboardAlertBar'
