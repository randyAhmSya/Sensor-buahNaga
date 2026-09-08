import React from 'react'
import { Zap, TrendingDown } from 'lucide-react'

interface EnergyConsumptionCardProps {
  energy: {
    kwh: number
    period: string
  }
}

export const EnergyConsumptionCard: React.FC<EnergyConsumptionCardProps> = ({ energy }) => {
  const weeklyUsage = [18, 22, 16, 19, 21, 14, 15]
  const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M']

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Konsumsi Energi</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">{energy.period}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{energy.kwh}</span>
            <span className="text-sm font-semibold text-slate-500">kWh</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>4.2% lebih hemat dari rata-rata blok lain</span>
          </div>
        </div>
      </div>

      {/* Mini Bar Chart Konsumsi Harian */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-end justify-between gap-1.5 h-14 pt-2">
          {weeklyUsage.map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                className="w-full bg-emerald-100 group-hover:bg-emerald-600 rounded-sm transition-colors"
                style={{ height: `${(val / 24) * 100}%` }}
                title={`${val} kWh`}
              />
              <span className="text-[10px] text-slate-400 font-medium">{days[idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
