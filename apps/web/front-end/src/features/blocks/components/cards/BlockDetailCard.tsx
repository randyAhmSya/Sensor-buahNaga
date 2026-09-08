import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Maximize2 } from 'lucide-react'
import type { BlockItem } from '@/types/block.types'

interface BlockDetailCardProps {
  block: BlockItem
  farmId?: string
}

export const BlockDetailCard: React.FC<BlockDetailCardProps> = ({ block, farmId = 'farm-1' }) => {
  const navigate = useNavigate()
  const isOnline = block.status === 'Online'

  return (
    <div
      onClick={() => navigate(`/admin/farms/${farmId}/blocks/${block.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col"
    >
      <div className="h-44 w-full overflow-hidden relative border-b border-slate-100">
        <img
          src={block.imageUrl}
          alt={block.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
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
