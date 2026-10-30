import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Maximize2 } from 'lucide-react'
import type { BlockItem } from '@/types/block.types'
import { DEFAULT_FARM_TEMPLATE_IMAGE } from '@/config/constants'

interface BlockDetailCardProps {
  block: BlockItem
  farmId?: string
}

export const BlockDetailCard: React.FC<BlockDetailCardProps> = ({ block, farmId = '' }) => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [templateError, setTemplateError] = useState(false)

  const hasCustomImage = Boolean(block.imageUrl && block.imageUrl.trim() && !imgError)
  const displayImageUrl = hasCustomImage
    ? block.imageUrl
    : (!templateError ? DEFAULT_FARM_TEMPLATE_IMAGE : null)

  const blockId = block.id_blok ?? block.id
  const targetUrl = farmId
    ? `/kebun/farms/${farmId}/blocks/${blockId}`
    : `/kebun/blocks/${blockId}`

  return (
    <div
      onClick={() => navigate(targetUrl)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col"
    >
      <div className="h-44 w-full overflow-hidden relative border-b border-slate-100 bg-slate-100">
        {displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt={block.name}
            loading="lazy"
            decoding="async"
            onError={() => {
              if (hasCustomImage) {
                setImgError(true)
              } else {
                setTemplateError(true)
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 flex items-center justify-center text-white p-4">
            <span className="text-sm font-bold text-slate-100">{block.name}</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs flex items-center gap-1.5 ${
              block.status === 'Online'
                ? 'bg-white border-emerald-600 text-emerald-700'
                : block.status === 'Offline'
                ? 'bg-white border-rose-300 text-rose-700'
                : 'bg-white border-slate-300 text-slate-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                block.status === 'Online'
                  ? 'bg-emerald-500'
                  : block.status === 'Offline'
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
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
