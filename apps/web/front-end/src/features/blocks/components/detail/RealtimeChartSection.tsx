import React, { useState } from 'react'
import { Activity } from 'lucide-react'

export type TimeFilter = '24 Jam' | '7 Hari' | '30 Hari'

interface RealtimeChartSectionProps {
  selectedRange?: TimeFilter
  onRangeChange?: (range: TimeFilter) => void
  hasTelemetry?: boolean
  isOnline?: boolean
  deviceId?: string
}

export const RealtimeChartSection: React.FC<RealtimeChartSectionProps> = ({
  selectedRange: externalRange,
  onRangeChange,
  hasTelemetry = false,
  isOnline = false,
  deviceId = 'Belum Terpasang',
}) => {
  const [internalRange, setInternalRange] = useState<TimeFilter>('24 Jam')
  const selectedRange = externalRange || internalRange

  const handleRangeChange = (range: TimeFilter) => {
    if (onRangeChange) {
      onRangeChange(range)
    } else {
      setInternalRange(range)
    }
  }

  const timeRanges: TimeFilter[] = ['24 Jam', '7 Hari', '30 Hari']
  const showChart = hasTelemetry && isOnline && deviceId !== 'Belum Terpasang'

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs h-full flex flex-col justify-between space-y-5">
      {/* Header & Filter Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-700" />
          <h3 className="text-base font-bold text-slate-900">Telemetri Intensitas & Suhu</h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {timeRanges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => handleRangeChange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRange === range
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Grafik atau Empty State Murni */}
      {!showChart ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3 shadow-2xs">
            <Activity className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            {deviceId === 'Belum Terpasang' ? 'Node Belum Dipasangkan' : 'Sensor Terhubung'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm">
            {deviceId === 'Belum Terpasang'
              ? 'Pasangkan perangkat node sensor IoT pada blok ini untuk mulai mengukur intensitas cahaya dan suhu secara real-time.'
              : 'Sensor terhubung. Menunggu pengiriman data telemetri pertama...'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col justify-center py-2">
            <div className="relative h-44 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                <defs>
                  <linearGradient id="luxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d="M0,110 Q50,90 100,60 T200,40 T300,55 T400,25 T500,45 L500,140 L0,140 Z"
                  fill="url(#luxGradient)"
                />
                <path
                  d="M0,110 Q50,90 100,60 T200,40 T300,55 T400,25 T500,45"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                />
                <path
                  d="M0,125 Q60,115 120,105 T220,95 T320,100 T420,85 T500,90"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-3 px-1 border-t border-slate-100">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>Sekarang</span>
            </div>
          </div>

          {/* Legenda Indikator */}
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-600 rounded-full" />
                <span className="text-slate-600 font-medium">Intensitas Lux</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-600 rounded-full border-b border-dashed" />
                <span className="text-slate-600 font-medium">Suhu Udara</span>
              </div>
            </div>
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">Interval: 5 Menit</span>
          </div>
        </>
      )}
    </div>
  )
}
