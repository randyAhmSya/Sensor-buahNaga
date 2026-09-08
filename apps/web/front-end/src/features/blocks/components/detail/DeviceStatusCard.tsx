import React from 'react'
import { Sun, Thermometer, Radio, Clock, Cpu } from 'lucide-react'

interface DeviceStatusCardProps {
  deviceId: string
  deviceStatus: 'Online' | 'Offline'
  currentLux: string
  temperature: string
  gateway: string
  lastSeen: string
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  deviceId,
  deviceStatus,
  currentLux,
  temperature,
  gateway,
  lastSeen,
}) => {
  const isOnline = deviceStatus === 'Online'

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs h-full flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        {/* Header: ID Perangkat & Status */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-slate-700 tracking-wide">{deviceId}</span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isOnline
                ? 'bg-white border-emerald-600 text-emerald-700'
                : 'bg-white border-slate-300 text-slate-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}
            />
            {deviceStatus}
          </span>
        </div>

        {/* Intensitas Cahaya (Hero Metric) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Intensitas Cahaya Saat Ini</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{currentLux}</span>
            <span className="text-sm font-semibold text-slate-500">Lux</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Kondisi optimal untuk fotosintesis vegetatif</p>
        </div>
      </div>

      {/* Mini-grid Suhu & Gateway */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>Suhu Udara</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{temperature}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gateway</span>
            </div>
            <p className="text-xs font-bold text-slate-800 truncate" title={gateway}>
              {gateway}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Terakhir disinkronkan
          </span>
          <span className="font-semibold text-slate-600">{lastSeen}</span>
        </div>
      </div>
    </div>
  )
}
