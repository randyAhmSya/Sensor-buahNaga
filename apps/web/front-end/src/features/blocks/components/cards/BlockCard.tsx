import React from 'react'
import { Maximize2, Radio, RadioTower } from 'lucide-react'
import type { BlockItem } from '@/types/block.types'

interface BlockCardProps {
  block: BlockItem
  onClick?: (block: BlockItem) => void
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, onClick }) => {
  const isOnline = block.status === 'Online'

  return (
    <div
      onClick={() => onClick?.(block)}
      className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
        isOnline
          ? 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md active:scale-[0.99]'
          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 opacity-90'
      }`}
    >
      <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-slate-100">
        <img
          src={block.imageUrl}
          alt={block.name}
          className={`w-full h-full object-cover ${!isOnline ? 'grayscale-[40%]' : ''}`}
        />
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-[96px] py-0.5">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-slate-900 text-base">{block.name}</h4>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1.5 border ${
                isOnline
                  ? 'bg-white border-emerald-500 text-emerald-700'
                  : 'bg-white border-slate-300 text-slate-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
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
