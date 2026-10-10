import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Grid,
  ChevronRight,
  CheckCircle2,
  PauseCircle,
  Sprout,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { FarmItem } from '@/types/farm.types'

interface FarmCardProps {
  farm: FarmItem
  isSelected?: boolean
  onSelect: (id: string) => void
  onEdit?: (farm: FarmItem) => void
  onDelete?: (farm: FarmItem) => void
}

export const FarmCard: React.FC<FarmCardProps> = ({
  farm,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const showFallback = !farm.imageUrl || !farm.imageUrl.trim() || imgError

  return (
    <div
      onClick={() => onSelect(farm.id)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group border border-slate-200 hover:border-emerald-600 hover:shadow-md relative"
    >
      {/* Gambar / Fallback Header */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex items-center justify-center">
        {showFallback ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-emerald-700 select-none p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/80 border border-emerald-200 shadow-2xs flex items-center justify-center mb-2">
              <Sprout className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-700 line-clamp-1">{farm.name}</span>
            <span className="text-[11px] text-slate-400 font-medium">AgroLight Smart Farm</span>
          </div>
        ) : (
          <img
            src={farm.imageUrl}
            alt={farm.name}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              farm.status === 'Inaktif' ? 'grayscale-[40%]' : ''
            }`}
          />
        )}

        {/* Status Badge di Kiri Atas */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
              farm.status === 'Aktif'
                ? 'bg-white border border-emerald-600 text-emerald-800'
                : 'bg-white border border-slate-300 text-slate-600'
            }`}
          >
            {farm.status === 'Aktif' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
            )}
            {farm.status}
          </span>
        </div>

        {/* Menu Titik Tiga di Kanan Atas */}
        <div className="absolute top-4 right-4 z-20">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen((prev) => !prev)
              }}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-slate-900 shadow-xs border border-slate-200/80 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Menu kebun"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMenuOpen(false)
                  }}
                />
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-150"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                      if (onEdit) {
                        onEdit(farm)
                      } else {
                        navigate(`/admin/farms/${farm.id}/edit`)
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Kebun</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMenuOpen(false)
                      onDelete?.(farm)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hapus Kebun</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body Card */}
      <div className="p-5 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {farm.name}
          </h3>
          <div className="flex items-center gap-1 text-slate-500 text-sm mt-1 font-medium">
            <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
            <span>{farm.location}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="border border-slate-200 p-2 rounded-xl text-slate-600 bg-white shadow-2xs">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Blok</span>
              <p className="text-base font-bold text-slate-900">{farm.totalBlocks} Blok</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 transition-all duration-200 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  )
}
