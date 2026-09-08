import React from 'react'
import { Activity, Wifi, WifiOff } from 'lucide-react'
import type { SensorSummaryMetrics } from '@/data/mockSensors'

interface SensorSummaryCardsProps {
  metrics: SensorSummaryMetrics
}

export const SensorSummaryCards: React.FC<SensorSummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Node */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center bg-slate-50 text-slate-700 shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Node Sensor</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{metrics.totalNodes}</p>
        </div>
      </div>

      {/* Node Online */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-12 h-12 rounded-xl border border-emerald-200 flex items-center justify-center bg-white text-emerald-700 shrink-0">
          <Wifi className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Node Online</p>
          <p className="text-2xl font-bold text-emerald-700 mt-0.5">{metrics.onlineNodes}</p>
        </div>
      </div>

      {/* Node Offline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-12 h-12 rounded-xl border border-rose-200 flex items-center justify-center bg-white text-rose-600 shrink-0">
          <WifiOff className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Node Offline / Masalah</p>
          <p className="text-2xl font-bold text-rose-600 mt-0.5">{metrics.offlineNodes}</p>
        </div>
      </div>
    </div>
  )
}
