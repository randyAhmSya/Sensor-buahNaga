import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Maximize2, Radio, RadioTower } from 'lucide-react'
import type { BlockItem } from '@/types/block.types'
import { DEFAULT_FARM_TEMPLATE_IMAGE } from '@/config/constants'

interface BlockCardProps {
  block: BlockItem
  farmId?: string
  onClick?: (block: BlockItem) => void
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, farmId, onClick }) => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [templateError, setTemplateError] = useState(false)
  const isOnline = block.status === 'Online'

  const hasCustomImage = Boolean(block.imageUrl && block.imageUrl.trim() && !imgError)
  const displayImageUrl = hasCustomImage
    ? block.imageUrl
    : (!templateError ? DEFAULT_FARM_TEMPLATE_IMAGE : null)

  const blockId = block.id_blok ?? block.id

  const handleClick = () => {
    if (onClick) {
      onClick(block)
    } else {
      const targetUrl = farmId
        ? `/kebun/farms/${farmId}/blocks/${blockId}`
        : `/kebun/blocks/${blockId}`
      navigate(targetUrl)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex items-start gap-4 group ${
        isOnline
          ? 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md active:scale-[0.99]'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs active:scale-[0.99]'
      }`}
    >
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative bg-slate-100 flex items-center justify-center">
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
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              !isOnline ? 'grayscale-[35%]' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-slate-900 flex items-center justify-center text-white select-none">
            <span className="text-xs font-bold">{block.name.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-[96px] py-0.5">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-slate-900 text-base">{block.name}</h4>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1.5 border ${
                block.status === 'Online'
                  ? 'bg-white border-emerald-500 text-emerald-700'
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
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {block.description}
          </p>
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{block.area}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
            {isOnline ? (
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <RadioTower className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{block.nodeSensor}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
