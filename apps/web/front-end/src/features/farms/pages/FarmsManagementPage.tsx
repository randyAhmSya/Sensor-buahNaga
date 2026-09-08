import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FarmCard } from '../components/FarmCard'
import { FarmFilterDropdown } from '../components/FarmFilterDropdown'
import { BlockCard } from '@/features/blocks/components/cards/BlockCard'
import { BlockTelemetryPreviewModal } from '@/features/blocks/components/cards/BlockTelemetryPreviewModal'
import { useFarmFilter } from '../hooks/useFarmFilter'
import type { BlockItem } from '@/types/block.types'

export const FarmsManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    filteredFarms,
    selectedFarmId,
    setSelectedFarmId,
    selectedFarm,
    isLoading,
  } = useFarmFilter()

  const [activeBlockPreview, setActiveBlockPreview] = useState<BlockItem | null>(null)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Memuat data kebun...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Section 1: Header Kebun */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Daftar Kebun
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola lokasi kebun buah naga dan sistem otomatisasi pencahayaannya.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/farms/new')}
            leftIcon={<Plus className="w-4 h-4 shrink-0" />}
            className="flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs whitespace-nowrap"
          >
            <span>Tambah Kebun</span>
          </Button>
        </div>

        {/* Grid Kartu Kebun */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              isSelected={farm.id === selectedFarmId}
              onSelect={(id) => navigate(`/admin/farms/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Detail Blok Berdasarkan Kebun Terpilih */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Sprout className="w-4 h-4" />
              <span>Kebun Terpilih</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Blok di {selectedFarm ? selectedFarm.name : 'Kebun'}
            </h2>
          </div>

          {/* Filter Dropdown */}
          <FarmFilterDropdown
            farms={filteredFarms}
            selectedFarmId={selectedFarmId}
            onSelectFarm={setSelectedFarmId}
          />
        </div>

        {/* Grid Blok Bento */}
        {selectedFarm && selectedFarm.blocks && selectedFarm.blocks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedFarm.blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                onClick={() => navigate(`/admin/farms/${selectedFarm.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm text-slate-400">Belum ada data blok untuk kebun ini.</p>
          </div>
        )}
      </section>

      {/* Modal Preview Telemetri Blok */}
      <BlockTelemetryPreviewModal
        block={activeBlockPreview}
        onClose={() => setActiveBlockPreview(null)}
      />
    </div>
  )
}

export default FarmsManagementPage
