import React from 'react'
import { useSensorMonitoring } from '../hooks/useSensorMonitoring'
import { SensorSummaryCards } from '../components/SensorSummaryCards'
import { SensorFilterBar } from '../components/SensorFilterBar'
import { SensorNodeCard } from '../components/SensorNodeCard'

export const SensorMonitoringPage: React.FC = () => {
  const {
    summaryMetrics,
    filteredSensors,
    searchTerm,
    setSearchTerm,
    selectedFarm,
    setSelectedFarm,
    selectedStatus,
    setSelectedStatus,
    isLoading,
  } = useSensorMonitoring()

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
      {/* Header Halaman */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Monitoring Sensor</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Pantau kesehatan dan intensitas lux seluruh node sensor IoT di setiap blok lahan secara real-time.
        </p>
      </div>

      {/* Ringkasan Status Node */}
      <SensorSummaryCards metrics={summaryMetrics} />

      {/* Filter & Grid Sensor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
        <SensorFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFarm={selectedFarm}
          onFarmChange={setSelectedFarm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {filteredSensors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSensors.map((sensor) => (
              <SensorNodeCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-700">Tidak ada node sensor yang sesuai.</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SensorMonitoringPage
