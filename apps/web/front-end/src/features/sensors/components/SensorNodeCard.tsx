import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Thermometer, Radio } from 'lucide-react'
import type { SensorNodeItem } from '@/data/mockSensors'
import { SensorSparkline } from './SensorSparkline'

interface SensorNodeCardProps {
  sensor: SensorNodeItem
}

export const SensorNodeCard: React.FC<SensorNodeCardProps> = ({ sensor }) => {
  const navigate = useNavigate()
  const isOnline = sensor.status === 'Online'

  return (
    <div
      onClick={() => navigate(`/admin/farms/${sensor.farmId}/blocks/${sensor.blockId}`)}
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer shadow-2xs group flex flex-col justify-between ${
        isOnline
          ? 'border-slate-200 hover:border-emerald-600 hover:shadow-md'
          : 'border-slate-200 bg-slate-50/40 hover:border-rose-400 opacity-90'
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isOnline ? 'text-emerald-700' : 'text-slate-400'}`} />
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {sensor.nodeCode}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {sensor.farmName} • <span className="font-semibold text-slate-700">{sensor.blockName}</span>
            </p>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shadow-2xs ${
              isOnline
                ? 'bg-white border-emerald-600 text-emerald-700'
                : 'bg-white border-rose-300 text-rose-600'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-rose-500'}`} />
            {sensor.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Intensitas Lux</span>
            </div>
            <p className={`text-base font-bold ${isOnline ? 'text-slate-900' : 'text-slate-400'}`}>
              {isOnline ? `${sensor.luxLevel.toLocaleString('id-ID')} lx` : '-- lx'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium mb-1">
              <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
              <span>Suhu Udara</span>
            </div>
            <p className={`text-base font-bold ${isOnline ? 'text-slate-900' : 'text-slate-400'}`}>
              {isOnline ? `${sensor.temperature} °C` : '-- °C'}
            </p>
          </div>
        </div>
      </div>

      <div>
        <SensorSparkline data={sensor.sparklineData} isOnline={isOnline} />
        <p className="text-[11px] text-slate-400 text-right mt-2 font-medium">Terakhir sinkron: {sensor.lastSeen}</p>
      </div>
    </div>
  )
}
