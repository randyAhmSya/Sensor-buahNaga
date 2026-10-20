import React from 'react'
import { Zap, TrendingDown } from 'lucide-react'

export interface EnergyConsumptionCardProps {
  energy: {
    kwh: number
    period: string
  }
  history?: Array<{
    id: string
    sensor_id: string
    konsumsi_watt: number
    dicatat_pada: string
  }>
}

export const EnergyConsumptionCard: React.FC<EnergyConsumptionCardProps> = ({ energy, history }) => {
  const numericKwh = typeof energy?.kwh === 'number' ? energy.kwh : parseFloat(String(energy?.kwh || 0)) || 0
  const formattedKwh = numericKwh.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // Format riwayat konsumsi jika tersedia dari backend
  const hasHistory = history && history.length > 0
  const recentHistory = hasHistory ? history.slice(-7) : []
  const maxWatt = Math.max(...recentHistory.map((h) => h.konsumsi_watt), 100)

  const fallbackUsage = [18, 22, 16, 19, 21, 14, 15]
  const defaultDays = ['S', 'S', 'R', 'K', 'J', 'S', 'M']

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Konsumsi Energi</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">{energy.period || 'Bulan Ini'}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{formattedKwh}</span>
            <span className="text-sm font-semibold text-slate-500">kWh</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            {numericKwh > 0 ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-700 font-semibold">Efisiensi pemakaian lampu aktif</span>
              </>
            ) : (
              <span>Belum ada akumulasi konsumsi listrik tercatat periode ini.</span>
            )}
          </div>
        </div>
      </div>

      {/* Mini Bar Chart Konsumsi Harian atau Empty State */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {numericKwh > 0 ? (
          <div className="flex items-end justify-between gap-1.5 h-14 pt-2">
            {hasHistory ? (
              recentHistory.map((item, idx) => {
                const dateObj = new Date(item.dicatat_pada)
                const dayLabel = !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString('id-ID', { weekday: 'narrow' })
                  : `D${idx + 1}`
                const heightPercent = Math.min(100, Math.max(15, (item.konsumsi_watt / maxWatt) * 100))

                return (
                  <div key={item.id || idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full bg-emerald-100 group-hover:bg-emerald-600 rounded-sm transition-colors"
                      style={{ height: `${heightPercent}%` }}
                      title={`${item.konsumsi_watt} Watt (${item.dicatat_pada})`}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">{dayLabel}</span>
                  </div>
                )
              })
            ) : (
              fallbackUsage.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-emerald-100 group-hover:bg-emerald-600 rounded-sm transition-colors"
                    style={{ height: `${(val / 24) * 100}%` }}
                    title={`${val} kWh`}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">{defaultDays[idx]}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="py-2 text-center text-[11px] text-slate-400 font-medium">
            Meteran energi akan mencatat daya otomatis saat lampu penyinaran beroperasi.
          </div>
        )}
      </div>
    </div>
  )
}
