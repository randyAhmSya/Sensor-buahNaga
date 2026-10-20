import React from 'react'
import { Sun, Thermometer, Radio, Clock, Cpu } from 'lucide-react'

interface DeviceStatusCardProps {
  deviceId: string
  deviceStatus: 'Online' | 'Offline' | string
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
  const isUninstalled = !deviceId || deviceId === 'Belum Terpasang'
  const isOnline =
    !isUninstalled &&
    (deviceStatus?.toLowerCase() === 'online' ||
      deviceStatus?.toLowerCase() === 'aktif' ||
      deviceStatus?.toLowerCase() === 'terhubung')
  const statusLabel = isOnline
    ? (deviceStatus === 'Aktif' ? 'Aktif' : 'Terhubung')
    : (deviceStatus === 'Belum Terhubung' ? 'Belum Terhubung' : 'Offline')

  if (isUninstalled) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs h-full flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600 tracking-wide">Status Perangkat</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-200 bg-slate-50 text-slate-600">
              Belum Terpasang
            </span>
          </div>

          <div className="py-6 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-1 shadow-2xs">
              <Radio className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Node Sensor Belum Dipasangkan</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Blok lahan ini belum dihubungkan dengan perangkat node sensor IoT.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          Pilih node sensor pada tombol <span className="font-semibold text-slate-600">Edit Blok</span> untuk mengaktifkan telemetri.
        </div>
      </div>
    )
  }

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
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-50 border-slate-300 text-slate-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}
            />
            {statusLabel}
          </span>
        </div>

        {/* Intensitas Cahaya (Hero Metric) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Sun className="w-4 h-4 text-emerald-600" />
            <span>Intensitas Cahaya Saat Ini</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {isOnline ? currentLux : '-- lx'}
            </span>
            {isOnline && <span className="text-sm font-semibold text-slate-500">Lux</span>}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {isOnline
              ? 'Sensor membaca intensitas cahaya tanaman secara aktif'
              : 'Perangkat offline atau dalam mode transmisi hemat daya'}
          </p>
        </div>
      </div>

      {/* Mini-grid Suhu & Gateway */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Thermometer className="w-3.5 h-3.5 text-slate-500" />
              <span>Suhu Udara</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {isOnline ? temperature : '-- °C'}
            </p>
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
