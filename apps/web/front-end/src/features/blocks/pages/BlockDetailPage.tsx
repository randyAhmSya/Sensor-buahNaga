import React from 'react'
import { useParams } from 'react-router-dom'
import { useBlockDetail } from '../hooks/useBlockDetail'
import { BlockDetailBanner } from '../components/detail/BlockDetailBanner'
import { DeviceStatusCard } from '../components/detail/DeviceStatusCard'
import { RealtimeChartSection } from '../components/detail/RealtimeChartSection'
import { LightingScheduleCard } from '../components/detail/LightingScheduleCard'
import { EnergyConsumptionCard } from '../components/detail/EnergyConsumptionCard'
import { HarvestCycleCard } from '../components/detail/HarvestCycleCard'
import { CycleHistoryTable } from '../components/tables/CycleHistoryTable'
import { SensorLogTable } from '../components/tables/SensorLogTable'

export const BlockDetailPage: React.FC = () => {
  const { farmId, blockId } = useParams<{ farmId: string; blockId: string }>()
  const { data, isLoading, telemetryRange, setTelemetryRange } = useBlockDetail(
    farmId || 'farm-1',
    blockId || 'blk-1'
  )

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Memuat detail blok...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BlockDetailBanner
        farmId={data.farmId}
        farmName={data.farmName}
        blockId={data.id}
        name={data.name}
        area={data.area}
        bannerUrl={data.bannerUrl}
      />

      {/* Grid Status Perangkat & Grafik Realtime */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4 flex flex-col">
          <DeviceStatusCard
            deviceId={data.deviceId}
            deviceStatus={data.deviceStatus}
            currentLux={data.currentLux}
            temperature={data.temperature}
            gateway={data.gateway}
            lastSeen={data.lastSeen}
          />
        </div>
        <div className="lg:col-span-8 flex flex-col">
          <RealtimeChartSection
            selectedRange={telemetryRange}
            onRangeChange={setTelemetryRange}
          />
        </div>
      </div>

      {/* Grid Kontrol Operasional 3 Kolom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LightingScheduleCard schedule={data.lightingSchedule} />
        <EnergyConsumptionCard energy={data.energyConsumption} />
        <HarvestCycleCard harvest={data.harvestCycle} />
      </div>

      {/* Tabel Riwayat Siklus */}
      <CycleHistoryTable history={data.cycleHistory} />

      {/* Tabel Riwayat Log Sensor Detail */}
      <SensorLogTable logs={data.sensorLogs} />
    </div>
  )
}

export default BlockDetailPage
