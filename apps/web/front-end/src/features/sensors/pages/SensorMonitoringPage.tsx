import React, { useState } from 'react'
import { Plus } from 'lucide-react'
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
    sensors,
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
    createSensor,
    editSensor,
    deleteSensor,
  } = useSensorMonitoring()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSensorToEdit, setSelectedSensorToEdit] = useState<SensorNodeItem | null>(null)
  const [selectedSensorToDelete, setSelectedSensorToDelete] = useState<SensorNodeItem | null>(null)

  const isInitialLoading = isLoading && sensors.length === 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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

        {isInitialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded-full w-20" />
                </div>
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-10 bg-slate-100 rounded-xl" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSensors.length > 0 ? (
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
          sensors={sensors}
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
