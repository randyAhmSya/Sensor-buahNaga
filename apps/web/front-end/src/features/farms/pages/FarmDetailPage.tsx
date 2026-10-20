import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FarmDetailHeader } from '../components/FarmDetailHeader'
import { BlockDetailCard } from '@/features/blocks/components/cards/BlockDetailCard'
import { BlockFilterDropdown } from '@/features/blocks/components/cards/BlockFilterDropdown'
import { farmService } from '@/services/farmService'
import type { FarmItem } from '@/types/farm.types'

export const FarmDetailPage: React.FC = () => {
  const params = useParams<{ farmId?: string; id?: string }>()
  const farmId = params.farmId ?? params.id
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Semua Blok')
  const [farm, setFarm] = useState<FarmItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!farmId || farmId === 'farm-1') {
      setFarm(null)
      setIsLoading(false)
      return
    }
    farmService.getById(farmId).then((res) => {
      setFarm(res || null)
      setIsLoading(false)
    }).catch(() => {
      setFarm(null)
      setIsLoading(false)
    })
  }, [farmId])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Memuat detail kebun...</p>
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
    if (filter === 'Belum Terpasang') return block.status === 'Offline'
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
