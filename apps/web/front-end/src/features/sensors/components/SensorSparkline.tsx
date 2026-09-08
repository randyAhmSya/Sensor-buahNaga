import React from 'react'

interface SensorSparklineProps {
  data: number[]
  isOnline: boolean
}

export const SensorSparkline: React.FC<SensorSparklineProps> = ({ data, isOnline }) => {
  if (!isOnline || data.length === 0) {
    return (
      <div className="h-10 w-full border-t border-slate-100 pt-2 flex items-center justify-center">
        <span className="text-[11px] font-medium text-slate-400">Data Tidak Tersedia</span>
      </div>
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100
      const y = 20 - ((val - min) / range) * 16
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="h-10 w-full border-t border-slate-100 pt-2">
      <svg className="w-full h-full text-emerald-600" preserveAspectRatio="none" viewBox="0 0 100 20">
        <polyline fill="none" points={points} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}
