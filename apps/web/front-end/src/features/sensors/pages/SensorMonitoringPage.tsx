import React, { useState } from 'react'
import { CheckCircle2, AlertCircle, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSensorMonitoring } from '../hooks/useSensorMonitoring'
import { SensorSummaryCards } from '../components/SensorSummaryCards'
import { SensorFilterBar } from '../components/SensorFilterBar'
import { SensorNodeCard } from '../components/SensorNodeCard'
import { AddSensorModal } from '../components/AddSensorModal'
import { EditSensorModal } from '../components/EditSensorModal'
import { DeleteSensorModal } from '../components/DeleteSensorModal'
import type { SensorNodeItem } from '@/types/sensor.types'

export const SensorMonitoringPage: React.FC = () => {
  const {
    summaryMetrics,
    filteredSensors,
    farms,
    farmOptions,
    searchTerm,
    setSearchTerm,
    selectedFarm,
    setSelectedFarm,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    isActionLoading,
    toast,
    clearToast,
    createSensor,
    editSensor,
    deleteSensor,
  } = useSensorMonitoring()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSensorToEdit, setSelectedSensorToEdit] = useState<SensorNodeItem | null>(null)
  const [selectedSensorToDelete, setSelectedSensorToDelete] = useState<SensorNodeItem | null>(null)

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Memuat telemetri sensor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notifikasi Feedback Sukses / Error */}
      {toast && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 shadow-sm ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
          role="alert"
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-xs md:text-sm font-semibold">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={clearToast}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Monitoring Sensor</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Pantau kesehatan dan intensitas lux seluruh node sensor IoT di setiap blok lahan secara real-time.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4 shrink-0" />}
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
        >
          <span>Tambah Node</span>
        </Button>
      </div>

      {/* Ringkasan Status Node */}
      <SensorSummaryCards metrics={summaryMetrics} />

      {/* Filter & Grid Sensor */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 lg:p-7 shadow-2xs space-y-6">
        <SensorFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFarm={selectedFarm}
          onFarmChange={setSelectedFarm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          farmOptions={farmOptions}
        />

        {filteredSensors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSensors.map((sensor) => (
              <SensorNodeCard
                key={sensor.id}
                sensor={sensor}
                onEdit={(item) => setSelectedSensorToEdit(item)}
                onDelete={(item) => setSelectedSensorToDelete(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-700">Tidak ada node sensor yang sesuai.</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
          </div>
        )}
      </div>

      {/* Modal Tambah Node Baru */}
      {isAddModalOpen && (
        <AddSensorModal
          isOpen={isAddModalOpen}
          isSubmitting={isActionLoading}
          farms={farms}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={createSensor}
        />
      )}

      {/* Modal Edit Sensor */}
      {Boolean(selectedSensorToEdit) && (
        <EditSensorModal
          isOpen={Boolean(selectedSensorToEdit)}
          sensor={selectedSensorToEdit}
          isSubmitting={isActionLoading}
          farms={farms}
          onClose={() => setSelectedSensorToEdit(null)}
          onSubmit={editSensor}
        />
      )}

      {/* Modal Konfirmasi Hapus Sensor */}
      {Boolean(selectedSensorToDelete) && (
        <DeleteSensorModal
          isOpen={Boolean(selectedSensorToDelete)}
          sensor={selectedSensorToDelete}
          isDeleting={isActionLoading}
          onClose={() => setSelectedSensorToDelete(null)}
          onConfirm={deleteSensor}
        />
      )}
    </div>
  )
}

export default SensorMonitoringPage

