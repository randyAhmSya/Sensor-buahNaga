import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FarmDetailHeader } from '../components/FarmDetailHeader'
import { BlockDetailCard } from '@/features/blocks/components/cards/BlockDetailCard'
import { BlockFilterDropdown } from '@/features/blocks/components/cards/BlockFilterDropdown'
import { useFarmDetailQuery } from '@/hooks/queries/useFarmsQuery'

export const FarmDetailPage: React.FC = () => {
  const params = useParams<{ farmId?: string; id?: string }>()
  const farmId = params.farmId ?? params.id
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Semua Blok')

  const { data: farm = null, isLoading } = useFarmDetailQuery(farmId)

  if (isLoading && !farm) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* Skeleton Header Banner */}
        <div className="h-48 sm:h-64 bg-slate-200 rounded-3xl w-full" />

        {/* Skeleton Blok Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div className="h-6 bg-slate-200 rounded w-48" />
            <div className="h-10 bg-slate-200 rounded-xl w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="h-44 bg-slate-200 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!farm) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 mx-auto mb-3">
          <span className="text-xl font-bold">!</span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Kebun Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Data kebun tidak ditemukan atau telah dihapus.
        </p>
        <Button
          type="button"
          onClick={() => navigate('/kebun/farms')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-xl"
        >
          Kembali ke Daftar Kebun
        </Button>
      </div>
    )
  }

  const filteredBlocks = (farm.blocks || []).filter((block) => {
    if (filter === 'Sensor Aktif') return block.status === 'Online'
    if (filter === 'Belum Terpasang') {
      return (
        block.status === 'Belum Terpasang' ||
        block.status === 'Offline' ||
        block.nodeSensor === 'Belum Terpasang'
      )
    }
    return true
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <FarmDetailHeader
        farmId={farm.id}
        name={farm.name}
        location={farm.location}
        status={farm.status}
        bannerUrl={farm.bannerUrl}
      />

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Blok dalam Kebun Ini</h2>

          <div className="flex items-center gap-3">
            <BlockFilterDropdown
              currentFilter={filter}
              onFilterChange={setFilter}
            />

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => navigate(`/kebun/farms/${farm.id}/blocks/new`)}
              leftIcon={<Plus className="w-4 h-4 shrink-0" />}
              className="flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold whitespace-nowrap shadow-xs"
            >
              Tambah Blok
            </Button>
          </div>
        </div>

        {filteredBlocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlocks.map((block) => (
              <BlockDetailCard key={block.id} block={block} farmId={farm.id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="text-sm text-slate-400">Belum ada blok yang terdaftar di kebun ini.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default FarmDetailPage
