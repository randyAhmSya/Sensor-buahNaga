import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Maximize2, Layers } from 'lucide-react'
import type { BlockItem } from '@/types/block.types'

interface BlockDetailCardProps {
  block: BlockItem
  farmId?: string
}

export const BlockDetailCard: React.FC<BlockDetailCardProps> = ({ block, farmId = '' }) => {
  const navigate = useNavigate()
  const isOnline = block.status === 'Online'
  const [imgError, setImgError] = useState(false)
  const showFallback = !block.imageUrl || imgError

  return (
    <div
      onClick={() => farmId && navigate(`/admin/farms/${farmId}/blocks/${block.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col"
    >
      <div className="h-44 w-full overflow-hidden relative border-b border-slate-100 bg-slate-100">
        {showFallback ? (
          <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-xl bg-white/80 border border-emerald-100 shadow-2xs flex items-center justify-center text-emerald-700 mb-2 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-700">{block.name}</span>
          </div>
        ) : (
          <img
            src={block.imageUrl}
            alt={block.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs flex items-center gap-1.5 ${
              isOnline
                ? 'bg-white border-emerald-600 text-emerald-700'
                : 'bg-white border-slate-300 text-slate-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            {block.status}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {block.name}
          </h4>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Luas: {block.area}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-emerald-700">
          <Calendar className="w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">
            Estimasi panen: <span className="font-bold text-emerald-800">{block.harvestEstimate}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
