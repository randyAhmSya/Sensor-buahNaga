import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Edit3, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BlockDetailBannerProps {
  farmId: string
  farmName: string
  blockId?: string
  name: string
  area: string
  bannerUrl: string
}

export const BlockDetailBanner: React.FC<BlockDetailBannerProps> = ({
  farmId,
  farmName,
  blockId,
  name,
  area,
}) => {
  const navigate = useNavigate()
  const params = useParams<{ farmId?: string; blockId?: string }>()
  const effectiveFarmId = farmId || params.farmId || ''
  const effectiveBlockId = blockId || params.blockId || ''

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link to="/kebun/dashboard" className="hover:text-emerald-700 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to="/kebun/farms" className="hover:text-emerald-700 transition-colors">
          Kebun & Blok
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to={`/kebun/farms/${effectiveFarmId}`} className="hover:text-emerald-700 transition-colors">
          {farmName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold">{name}</span>
      </nav>

      {/* Clean White Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Maximize2 className="w-3.5 h-3.5" />
              Luas: {area}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {name}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium">
            Bagian dari <span className="font-semibold text-slate-900">{farmName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate(`/kebun/farms/${effectiveFarmId}/blocks/${effectiveBlockId}/edit`)}
            leftIcon={<Edit3 className="w-4 h-4 shrink-0" />}
            className="border border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 bg-white font-semibold flex flex-row items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Edit Blok</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
