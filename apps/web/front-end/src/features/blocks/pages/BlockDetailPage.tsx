import React from 'react'
import { useParams } from 'react-router-dom'
import { useBlockDetail } from '../hooks/useBlockDetail'
import { BlockDetailBanner } from '../components/detail/BlockDetailBanner'
import { DeviceStatusCard } from '../components/detail/DeviceStatusCard'
import { BlockLampStatusCard } from '../components/detail/BlockLampStatusCard'
import { RealtimeChartSection } from '../components/detail/RealtimeChartSection'
import { LightingScheduleCard } from '../components/detail/LightingScheduleCard'
import { EnergyConsumptionCard } from '../components/detail/EnergyConsumptionCard'
import { HarvestCycleCard } from '../components/detail/HarvestCycleCard'
import { CycleHistoryTable } from '../components/tables/CycleHistoryTable'
import { SensorLogTable } from '../components/tables/SensorLogTable'
import { LazyVisibleChart } from '@/components/common/LazyVisibleChart'

export const BlockDetailPage: React.FC = () => {
  const params = useParams<{ farmId?: string; blockId?: string; id?: string }>()
  const effectiveFarmId = params.farmId ?? ''
  const effectiveBlockId = params.blockId ?? params.id ?? ''

  const {
    data,
    statusLampu,
    telemetryData,
    energyData,
    isLoading,
    error,
    telemetryRange,
    setTelemetryRange,
    refetch,
  } = useBlockDetail(effectiveFarmId, effectiveBlockId)

  if (isLoading && !data) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-44 bg-slate-200 rounded-3xl w-full" />

        {/* Grid Status & Chart Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="h-52 bg-white rounded-2xl border border-slate-200 p-6" />
            <div className="h-52 bg-white rounded-2xl border border-slate-200 p-6" />
          </div>
          <div className="lg:col-span-7">
            <div className="h-full min-h-[380px] bg-white rounded-2xl border border-slate-200 p-6" />
          </div>
        </div>

        {/* 3 Card Kontrol Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-white rounded-2xl border border-slate-200 p-6" />
          <div className="h-44 bg-white rounded-2xl border border-slate-200 p-6" />
          <div className="h-44 bg-white rounded-2xl border border-slate-200 p-6" />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 mx-auto mb-3">
          <span className="text-xl font-bold">!</span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Gagal Memuat Detail Blok</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">{error}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-emerald-800 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  if (!data) return null

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

      {/* Grid Status Perangkat, Status Lampu & Grafik Realtime */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <DeviceStatusCard
            deviceId={data.deviceId}
            deviceStatus={data.deviceStatus}
            currentLux={data.currentLux}
            temperature={data.temperature}
            gateway={data.gateway}
            lastSeen={data.lastSeen}
          />
          <BlockLampStatusCard
            statusLampu={statusLampu}
          />
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <LazyVisibleChart minHeight="min-h-[340px]">
            <RealtimeChartSection
              selectedRange={telemetryRange}
              onRangeChange={setTelemetryRange}
              hasTelemetry={telemetryData.length > 0 || data.sensorLogs.length > 0}
              isOnline={(data.deviceStatus || '').toLowerCase() === 'online'}
              nodeStatus={data.deviceStatus}
              lastSeen={data.lastSeen}
              deviceId={data.deviceId}
              telemetryData={telemetryData}
            />
          </LazyVisibleChart>
        </div>
      </div>

      {/* Grid Kontrol Operasional 3 Kolom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LightingScheduleCard schedule={data.lightingSchedule} />
        <EnergyConsumptionCard
          energy={data.energyConsumption}
          history={energyData?.riwayat}
        />
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
