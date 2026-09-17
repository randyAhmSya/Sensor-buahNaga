import { useState, useRef, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Thermometer, Radio, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { SensorNodeItem } from '@/types/sensor.types'
import { SensorSparkline } from './SensorSparkline'

interface SensorNodeCardProps {
  sensor: SensorNodeItem
  onEdit?: (sensor: SensorNodeItem) => void
  onDelete?: (sensor: SensorNodeItem) => void
}

export const SensorNodeCard: FC<SensorNodeCardProps> = ({
  sensor,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate()
  const isOnline =
    sensor.status?.toLowerCase() === 'aktif' ||
    sensor.status?.toLowerCase() === 'online'
  const displayStatus = isOnline ? 'Aktif' : 'Nonaktif'
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1">
              <span>{sensor.farmName}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{sensor.blockName}</span>
              {sensor.gatewayCode && (
                <span className="inline-flex items-center gap-1 ml-1 text-slate-400">
                  <span>• GW: <strong className="text-slate-600">{sensor.gatewayCode}</strong></span>
                  {sensor.gatewayStatus && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                        sensor.gatewayStatus.toLowerCase() === 'terhubung'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {sensor.gatewayStatus.toLowerCase() === 'terhubung' ? 'Terhubung' : 'Belum Terhubung'}
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shadow-2xs ${
                isOnline
                  ? 'bg-white border-emerald-600 text-emerald-700'
                  : 'bg-white border-rose-300 text-rose-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-rose-500'}`} />
              {displayStatus}
            </span>

            {/* Menu Aksi Titik Tiga */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMenuOpen((prev) => !prev)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Opsi sensor"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-30 animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                      onEdit?.(sensor)
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                      onDelete?.(sensor)
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          </div>
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
