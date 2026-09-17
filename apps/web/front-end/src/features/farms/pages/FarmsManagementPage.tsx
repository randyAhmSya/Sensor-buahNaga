import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Sprout, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FarmCard } from '../components/FarmCard'
import { FarmFilterDropdown } from '../components/FarmFilterDropdown'
import { DeleteFarmModal } from '../components/DeleteFarmModal'
import { EditFarmModal } from '../components/EditFarmModal'
import { BlockCard } from '@/features/blocks/components/cards/BlockCard'
import { BlockTelemetryPreviewModal } from '@/features/blocks/components/cards/BlockTelemetryPreviewModal'
import { useFarmFilter } from '../hooks/useFarmFilter'
import { Toast } from '@/components/feedback/Toast'
import type { FarmItem } from '@/types/farm.types'
import type { BlockItem } from '@/types/block.types'

export const FarmsManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    filteredFarms,
    selectedFarmId,
    setSelectedFarmId,
    selectedFarm,
    isLoading,
    toast,
    setToast,
    clearToast,
    deleteFarm,
    updateFarmInState,
  } = useFarmFilter()

  const [activeBlockPreview, setActiveBlockPreview] = useState<BlockItem | null>(null)
  const [farmToDelete, setFarmToDelete] = useState<FarmItem | null>(null)
  const [farmToEdit, setFarmToEdit] = useState<FarmItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async (farmId: string, farmName: string) => {
    setIsDeleting(true)
    try {
      await deleteFarm(farmId, farmName)
    } finally {
      setIsDeleting(false)
      setFarmToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Memuat data kebun...</p>
      </div>
    )
  }

  const hasFarms = filteredFarms.length > 0

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Toast Notifikasi Feedback Sukses / Error */}
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={clearToast}
          />
        </div>
      )}

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
            className="flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs whitespace-nowrap cursor-pointer"
          >
            <span>Tambah Kebun</span>
          </Button>
        </div>

        {/* Grid Kartu Kebun atau Empty State Kebun */}
        {hasFarms ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => (
              <FarmCard
                key={farm.id}
                farm={farm}
                isSelected={farm.id === selectedFarmId}
                onSelect={(id) => navigate(`/admin/farms/${id}`)}
                onEdit={(f) => setFarmToEdit(f)}
                onDelete={(f) => setFarmToDelete(f)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <Sprout className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">Belum Ada Kebun Terdaftar</h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                Mulai daftarkan kebun buah naga Anda untuk mengelola blok lahan, memasang node sensor IoT, dan mengatur otomatisasi pencahayaan.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => navigate('/admin/farms/new')}
              leftIcon={<Plus className="w-4 h-4 shrink-0" />}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer mx-auto"
            >
              Tambah Kebun Pertama
            </Button>
          </div>
        )}
      </section>

      {/* Section 2: Detail Blok Berdasarkan Kebun Terpilih (Hanya tampil jika kebun ada) */}
      {hasFarms && (
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

          {/* Grid Blok Bento atau Empty State Blok */}
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
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
              <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mx-auto">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <p className="text-sm font-bold text-slate-800">Belum ada data blok untuk kebun ini.</p>
                <p className="text-xs text-slate-400">
                  Tambahkan blok lahan pada {selectedFarm?.name || 'kebun ini'} untuk mulai memantau pembungaan dan intensitas lux.
                </p>
              </div>
              {selectedFarm && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/farms/${selectedFarm.id}/blocks/new`)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="mt-2 text-xs font-semibold cursor-pointer border-slate-300 hover:border-emerald-600 hover:text-emerald-700"
                >
                  Tambah Blok Sekarang
                </Button>
              )}
            </div>
          )}
        </section>
      )}

      {/* Modal Preview Telemetri Blok */}
      <BlockTelemetryPreviewModal
        block={activeBlockPreview}
        onClose={() => setActiveBlockPreview(null)}
      />

      {/* Modal Konfirmasi Hapus Kebun */}
      <DeleteFarmModal
        isOpen={Boolean(farmToDelete)}
        farm={farmToDelete}
        isDeleting={isDeleting}
        onClose={() => setFarmToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal Edit Kebun */}
      <EditFarmModal
        isOpen={Boolean(farmToEdit)}
        farm={farmToEdit}
        onClose={() => setFarmToEdit(null)}
        onSuccess={(updatedFarm) => {
          updateFarmInState(updatedFarm)
          setToast({
            type: 'success',
            title: 'Perubahan Disimpan',
            message: `Data kebun "${updatedFarm.name}" berhasil diperbarui.`,
          })
        }}
      />
    </div>
  )
}

export default FarmsManagementPage
