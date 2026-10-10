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
  bannerUrl,
}) => {
  const navigate = useNavigate()
  const params = useParams<{ farmId?: string; blockId?: string }>()
  const effectiveFarmId = farmId || params.farmId || ''
  const effectiveBlockId = blockId || params.blockId || ''
  const [imgError, setImgError] = React.useState(false)
  const showFallback = !bannerUrl || imgError

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link to="/admin/dashboard" className="hover:text-emerald-700 transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to="/admin/farms" className="hover:text-emerald-700 transition-colors">
          Kebun & Blok
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to={`/admin/farms/${farmId}`} className="hover:text-emerald-700 transition-colors">
          {farmName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold">{name}</span>
      </nav>

      {/* Banner Card */}
      <div className="relative w-full h-56 md:h-64 rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 shadow-2xs group">
        {!showFallback && (
          <img
            src={bannerUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs text-white border border-white/20">
                <Maximize2 className="w-3.5 h-3.5" />
                Luas: {area}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-xs">
                {name}
              </h1>
              <p className="text-xs md:text-sm text-slate-200 font-medium">
                Bagian dari <span className="font-semibold text-white">{farmName}</span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate(`/admin/farms/${effectiveFarmId}/blocks/${effectiveBlockId}/edit`)}
              leftIcon={<Edit3 className="w-4 h-4 shrink-0" />}
              className="self-start md:self-auto border border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 bg-white font-semibold flex flex-row items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Edit Blok</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
