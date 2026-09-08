import React from 'react'
import { MapPin, Grid, ChevronRight, CheckCircle2, PauseCircle } from 'lucide-react'
import type { FarmItem } from '../types/farmTypes'

interface FarmCardProps {
  farm: FarmItem
  isSelected?: boolean
  onSelect: (id: string) => void
}

export const FarmCard: React.FC<FarmCardProps> = ({ farm, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(farm.id)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group border border-slate-200 hover:border-emerald-600 hover:shadow-md"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={farm.imageUrl}
          alt={farm.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            farm.status === 'Inaktif' ? 'grayscale-[40%]' : ''
          }`}
        />
        <div className="absolute top-4 left-4">
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
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {farm.name}
          </h3>
          <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
            <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
            <span>{farm.location}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="border border-slate-200 p-2 rounded-xl text-slate-600 bg-white">
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
