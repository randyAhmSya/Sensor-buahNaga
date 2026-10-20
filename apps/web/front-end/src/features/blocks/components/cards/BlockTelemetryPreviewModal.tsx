import React from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Radio, Maximize2, Layers, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { BlockItem } from '@/types/block.types'

interface BlockTelemetryPreviewModalProps {
  block: BlockItem | null
  onClose: () => void
}

export const BlockTelemetryPreviewModal: React.FC<BlockTelemetryPreviewModalProps> = ({
  block,
  onClose,
}) => {
  const navigate = useNavigate()

  if (!block) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-xl animate-in zoom-in-95 duration-150 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-preview-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-700">
            <Layers className="w-5 h-5" />
            <h3 id="block-preview-title" className="text-lg font-bold text-slate-900">
              {block.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl overflow-hidden h-40 border border-slate-100">
          <img src={block.imageUrl} alt={block.name} className="w-full h-full object-cover" />
        </div>

        {block.description && (
          <p className="text-xs text-slate-600 leading-relaxed">{block.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              Luas Area
            </span>
            <p className="text-sm font-bold text-slate-900">{block.area}</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              Node Sensor
            </span>
            <p className="text-sm font-bold text-slate-900">{block.nodeSensor || 'Node IoT'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              block.status === 'Online'
                ? 'bg-white border-emerald-500 text-emerald-700'
                : 'bg-white border-slate-300 text-slate-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                block.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            Status: {block.status}
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose()
              navigate('/kebun/sensors')
            }}
            className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex flex-row items-center whitespace-nowrap"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Buka Sensor
          </Button>
        </div>
      </div>
    </div>
  )
}
