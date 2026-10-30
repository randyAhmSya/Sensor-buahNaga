import React, { useState, useMemo } from 'react'
import { Activity } from 'lucide-react'
import type { ReadSensor } from '@/services/telemetryService'

export type TimeFilter = '24 Jam' | '7 Hari' | '30 Hari'

interface RealtimeChartSectionProps {
  selectedRange?: TimeFilter
  onRangeChange?: (range: TimeFilter) => void
  hasTelemetry?: boolean
  isOnline?: boolean
  nodeStatus?: string
  lastSeen?: string
  deviceId?: string
  telemetryData?: ReadSensor[]
}

export const RealtimeChartSection: React.FC<RealtimeChartSectionProps> = ({
  selectedRange: externalRange,
  onRangeChange,
  hasTelemetry = false,
  isOnline = false,
  nodeStatus = '',
  lastSeen = '',
  deviceId = 'Belum Terpasang',
  telemetryData = [],
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
  const isInstalled = deviceId && deviceId !== 'Belum Terpasang'
  const hasData = telemetryData.length > 0 || hasTelemetry
  const showChart = isInstalled && hasData && (isOnline || telemetryData.length > 0)

  // Filter data sesuai rentang waktu jika ada timestamp
  const displayData = useMemo(() => {
    if (telemetryData.length === 0) return []
    // Jika data banyak, bisa disesuaikan atau tampilkan semua
    return telemetryData
  }, [telemetryData])

  // Koordinat grafik SVG dinamis
  const chartPoints = useMemo(() => {
    if (displayData.length === 0) return null

    const N = displayData.length
    const luxValues = displayData.map((d) => Number(d.nilai_lux ?? d.lux ?? 0))
    const tempValues = displayData.map((d) => Number(d.suhu ?? d.temperature ?? 0))

    const maxLux = Math.max(...luxValues, 100)
    const minLux = Math.min(...luxValues, 0)
    const luxRange = maxLux - minLux || 1

    const maxTemp = Math.max(...tempValues, 40)
    const minTemp = Math.min(...tempValues, 15)
    const tempRange = maxTemp - minTemp || 1

    const width = 500
    const topY = 20
    const bottomY = 130
    const usableHeight = bottomY - topY

    const points = displayData.map((_, i) => {
      const x = N > 1 ? (i / (N - 1)) * (width - 20) + 10 : width / 2
      const yLux = bottomY - ((luxValues[i] - minLux) / luxRange) * usableHeight
      const yTemp = bottomY - ((tempValues[i] - minTemp) / tempRange) * usableHeight
      return { x, yLux, yTemp, lux: luxValues[i], temp: tempValues[i] }
    })

    const luxLinePath = points.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.yLux}` : `${acc} L ${pt.x},${pt.yLux}`),
      ''
    )
    const luxAreaPath = `${luxLinePath} L ${points[points.length - 1].x},${bottomY + 10} L ${points[0].x},${bottomY + 10} Z`

    const tempLinePath = points.reduce(
      (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.yTemp}` : `${acc} L ${pt.x},${pt.yTemp}`),
      ''
    )

    return {
      points,
      luxLinePath,
      luxAreaPath,
      tempLinePath,
      latestLux: luxValues[luxValues.length - 1],
      latestTemp: tempValues[tempValues.length - 1],
    }
  }, [displayData])

  // Ekstrak label waktu sumbu horizontal dari dicatat_pada
  const timeLabels = useMemo(() => {
    if (displayData.length === 0) return []

    const formatTime = (timeStr?: string) => {
      if (!timeStr) return '00:00'
      const dt = new Date(timeStr)
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
      const parts = timeStr.split(' ')
      return parts[1] ? parts[1].substring(0, 5) : timeStr.substring(0, 5)
    }

    const count = Math.min(5, displayData.length)
    if (count <= 1) {
      return [formatTime(displayData[0]?.dicatat_pada)]
    }

    const labels: string[] = []
    for (let i = 0; i < count; i++) {
      const idx = Math.round((i / (count - 1)) * (displayData.length - 1))
      labels.push(formatTime(displayData[idx]?.dicatat_pada))
    }
    return labels
  }, [displayData])

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs h-full flex flex-col justify-between space-y-5">
      {/* Header & Filter Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-700" />
          <h3 className="text-base font-bold text-slate-900">Telemetri Intensitas & Suhu</h3>
          {chartPoints && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white text-emerald-800 border-2 border-emerald-600 ml-1">
              {chartPoints.latestLux} lx | {chartPoints.latestTemp}°C
            </span>
          )}
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
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-3 shadow-2xs">
            <Activity className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            {!isInstalled
              ? 'Node Belum Dipasangkan'
              : (nodeStatus || '').toLowerCase() === 'offline'
              ? 'Node Offline'
              : 'Sensor Terhubung'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            {!isInstalled
              ? 'Pasangkan perangkat node sensor IoT pada blok ini untuk mulai mengukur intensitas cahaya dan suhu secara real-time.'
              : (nodeStatus || '').toLowerCase() === 'belum_pernah_terlihat'
              ? 'Menunggu data telemetri pertama...'
              : (nodeStatus || '').toLowerCase() === 'offline'
              ? `Node offline, data terakhir pada ${lastSeen && lastSeen.trim() ? lastSeen : 'Belum ada data'}`
              : 'Sensor terhubung. Menunggu data telemetri pertama...'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col justify-center py-2">
            <div className="relative h-44 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                <defs>
                  <linearGradient id="luxGradientDynamic" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {chartPoints ? (
                  <>
                    <path d={chartPoints.luxAreaPath} fill="url(#luxGradientDynamic)" />
                    <path
                      d={chartPoints.luxLinePath}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={chartPoints.tempLinePath}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {chartPoints.points.length <= 25 &&
                      chartPoints.points.map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.yLux}
                          r="3"
                          fill="#059669"
                          className="hover:r-4 transition-all"
                        >
                          <title>{`${pt.lux} lx`}</title>
                        </circle>
                      ))}
                  </>
                ) : (
                  <>
                    <path
                      d="M0,110 Q50,90 100,60 T200,40 T300,55 T400,25 T500,45 L500,140 L0,140 Z"
                      fill="url(#luxGradientDynamic)"
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
                  </>
                )}
              </svg>
            </div>

            {/* Sumbu Waktu Horisontal dicatat_pada */}
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-3 px-1 border-t border-slate-100">
              {timeLabels.length > 0 ? (
                timeLabels.map((lbl, idx) => <span key={idx}>{lbl}</span>)
              ) : (
                <>
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>Sekarang</span>
                </>
              )}
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
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
              Data riil sensor ({displayData.length} sampel)
            </span>
          </div>
        </>
      )}
    </div>
  )
}
