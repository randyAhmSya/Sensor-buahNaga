import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { BlockDetailBanner } from '../components/detail/BlockDetailBanner'
import { DeviceStatusCard } from '../components/detail/DeviceStatusCard'
import { RealtimeChartSection, type TimeFilter } from '../components/detail/RealtimeChartSection'
import { LightingScheduleCard } from '../components/detail/LightingScheduleCard'
import { EnergyConsumptionCard } from '../components/detail/EnergyConsumptionCard'
import { HarvestCycleCard } from '../components/detail/HarvestCycleCard'
import { CycleHistoryTable } from '../components/tables/CycleHistoryTable'
import { SensorLogTable } from '../components/tables/SensorLogTable'
import { blockService } from '@/services/blockService'
import type { BlockDetailFull } from '@/types/block.types'

export const BlockDetailPage: React.FC = () => {
  const { farmId, id, blockId } = useParams<{ farmId?: string; id?: string; blockId?: string }>()
  const effectiveBlockId = (blockId || id || '').trim()
  const effectiveFarmId = (farmId && farmId !== 'farm-1' && farmId !== 'undefined' ? farmId : '').trim()

  const [data, setData] = useState<BlockDetailFull | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [telemetryRange, setTelemetryRange] = useState<TimeFilter>('24 Jam')

  const lastFetchedBlockIdRef = useRef<string>('')

  const fetchBlock = useCallback(
    async (force = false) => {
      if (!effectiveBlockId || effectiveBlockId === 'blk-1') {
        setIsLoading(false)
        setData(null)
        return
      }

      // Cegah duplikasi pemanggilan request jika blockId yang sama sudah diambil
      if (!force && lastFetchedBlockIdRef.current === effectiveBlockId) {
        return
      }
      lastFetchedBlockIdRef.current = effectiveBlockId

      setIsLoading(true)
      setError(null)
      try {
        const result = await blockService.getById(effectiveFarmId, effectiveBlockId)
        setData(result)
      } catch (err: unknown) {
        setError((err as Error)?.message || 'Gagal memuat detail blok')
      } finally {
        setIsLoading(false)
      }
    },
    [effectiveBlockId, effectiveFarmId]
  )

  // Dependency array dirapikan: HANYA dipicu saat effectiveBlockId berubah
  useEffect(() => {
    fetchBlock()
  }, [effectiveBlockId])

  if (isLoading || (!data && !error)) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Memuat detail blok...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-3">
          <span className="text-xl font-bold">!</span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Gagal Memuat Detail Blok</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">{error}</p>
        <button
          type="button"
          onClick={() => fetchBlock(true)}
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
            hasTelemetry={data.sensorLogs.length > 0}
            isOnline={data.deviceStatus === 'Online'}
            deviceId={data.deviceId}
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
