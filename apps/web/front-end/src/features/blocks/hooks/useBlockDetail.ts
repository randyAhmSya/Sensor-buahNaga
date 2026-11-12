import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { BlockDetailFull, BlokStatusLampuResponse, SensorLogItem } from '@/types/block.types'
import { blockService } from '@/services/blockService'
import { fetchTelemetri, type ReadSensor } from '@/services/telemetryService'
import { fetchLogEnergy, type EnergyLogResponse } from '@/services/energyService'
import { gatewayService } from '@/services/gatewayService'
import { scheduleService } from '@/services/scheduleService'
import { useSensorsQuery } from '@/hooks/queries/useSensorsQuery'
import { findNodeForBlock } from '../utils/blockNodeMatcher'
import {
  blockKeys,
  scheduleKeys,
  gatewayKeys,
  telemetryKeys,
  energyKeys,
} from '@/services/queryKeys'
import type { TimeFilter } from '../components/detail/RealtimeChartSection'

export const useBlockDetail = (farmId: string, blockId: string) => {
  const [telemetryRange, setTelemetryRange] = useState<TimeFilter>('24 Jam')

  const cleanBlockId = (blockId || '').trim()
  const cleanFarmId = (farmId && farmId !== 'farm-1' && farmId !== 'undefined' ? farmId : '').trim()
  const isValidBlock = Boolean(cleanBlockId && cleanBlockId !== 'blk-1')

  // 1. Query Node Kebun bersama (membaca cache bersama tanpa fetch ganda)
  const { data: farmNodes = [] } = useSensorsQuery(cleanFarmId, {
    enabled: Boolean(cleanFarmId),
  })

  // 2. Pencocokan node milik blok secara murni di memori
  const activeNode = useMemo(() => {
    return findNodeForBlock(farmNodes, cleanBlockId)
  }, [farmNodes, cleanBlockId])

  const effectiveSensorId = activeNode?.id || undefined
  const effectiveGatewayId = activeNode?.gatewayId || undefined

  const hasValidSensor = Boolean(
    effectiveSensorId &&
    effectiveSensorId.trim() &&
    effectiveSensorId !== 'Belum Terpasang'
  )

  // 3. Query Statis Blok & Siklus Panen (jalan paralel dari awal, TIDAK menunggu node)
  const {
    data: rawBlock,
    isLoading: isLoadingBlock,
    error: blockError,
    refetch: refetchBlock,
  } = useQuery({
    queryKey: blockKeys.detail(cleanBlockId),
    queryFn: () => blockService.getById(cleanFarmId, cleanBlockId, effectiveSensorId),
    enabled: isValidBlock,
    staleTime: 5 * 60 * 1000, // 5 menit tanpa polling berkala
  })

  // 4. Query Jadwal (bergantung pada sensorId dari findNodeForBlock)
  const { data: activeSchedule } = useQuery({
    queryKey: scheduleKeys.active(effectiveSensorId || ''),
    queryFn: () => (effectiveSensorId ? scheduleService.getActive(effectiveSensorId, cleanFarmId) : null),
    enabled: hasValidSensor,
    staleTime: 5 * 60 * 1000,
  })

  // 5. Query Gateway (bergantung pada gatewayId jika belum memuat kode gateway)
  const { data: gatewayData } = useQuery({
    queryKey: gatewayKeys.detail(effectiveGatewayId || ''),
    queryFn: () => (effectiveGatewayId ? gatewayService.getById(effectiveGatewayId) : null),
    enabled: Boolean(effectiveGatewayId && !activeNode?.gatewayCode),
    staleTime: 5 * 60 * 1000,
  })

  // 6. Query Live Status Lampu (Polling 60s)
  const { data: statusLampu = null, refetch: refetchLampu } = useQuery<BlokStatusLampuResponse | null>({
    queryKey: blockKeys.statusLampu(cleanBlockId),
    queryFn: () => blockService.getStatusLampu(cleanBlockId),
    enabled: isValidBlock,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })

  // 7. Query Live Telemetri (Polling 60s)
  const { data: telemetryData = [], refetch: refetchTelemetri } = useQuery<ReadSensor[]>({
    queryKey: telemetryKeys.history(effectiveSensorId || '', 100),
    queryFn: () => (effectiveSensorId ? fetchTelemetri(effectiveSensorId, 100) : Promise.resolve([])),
    enabled: hasValidSensor,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })

  // 8. Query Live Log Energi (Polling 60s)
  const { data: energyData = null, refetch: refetchEnergy } = useQuery<EnergyLogResponse>({
    queryKey: energyKeys.logs(effectiveSensorId || ''),
    queryFn: () => (effectiveSensorId ? fetchLogEnergy(effectiveSensorId, 100) : Promise.resolve({ total_kwh: 0, riwayat: [] })),
    enabled: hasValidSensor,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })

  // 9. Agregasi data statis dan live ke dalam BlockDetailFull
  const data: BlockDetailFull | null = useMemo(() => {
    if (!rawBlock) return null

    const deviceId =
      activeNode?.nodeCode ||
      rawBlock.deviceId ||
      'Belum Terpasang'

    const gatewayName =
      gatewayData?.kode_perangkat ||
      activeNode?.gatewayCode ||
      rawBlock.gateway ||
      'Belum terpasang gateway'

    // Jadwal aktif gabungan
    let lightingSchedule = rawBlock.lightingSchedule
    if (activeSchedule && (activeSchedule.status_aktif === true || activeSchedule.status_aktif === 1)) {
      const startStr = activeSchedule.jam_mulai || activeSchedule.jam_mulai_nyala
      const endStr = activeSchedule.jam_selesai || activeSchedule.jam_akhir_nyala
      const cycleText =
        activeSchedule.nama_jadwal ||
        (startStr && endStr ? `${startStr.substring(0, 5)} - ${endStr.substring(0, 5)}` : 'Jadwal Aktif')
      const intensityVal = activeSchedule.instensitas_cahaya ?? activeSchedule.intensitas_cahaya
      lightingSchedule = {
        activeCycle: cycleText,
        intensity: intensityVal !== undefined && intensityVal !== null ? `${intensityVal}%` : 'Belum diatur',
      }
    }

    // Telemetri log dan nilai terkini
    const sensorLogs: SensorLogItem[] = telemetryData.map((t, idx) => {
      const dt = t.dicatat_pada ? new Date(t.dicatat_pada) : null
      const timeStr = dt && !isNaN(dt.getTime())
        ? dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : (t.dicatat_pada || 'Belum ada waktu')
      return {
        id: t.id || `${effectiveSensorId}-${idx}`,
        timestamp: timeStr,
        lux: `${t.nilai_lux ?? t.lux ?? 0} lx`,
        temperature: `${t.suhu ?? t.temperature ?? 0}°C`,
      }
    })

    const latest = telemetryData.length > 0 ? telemetryData[telemetryData.length - 1] : null
    let currentLux = rawBlock.currentLux
    let temperature = rawBlock.temperature
    let lastSeen = rawBlock.lastSeen

    if (latest) {
      if (latest.nilai_lux !== undefined || latest.lux !== undefined) {
        currentLux = `${latest.nilai_lux ?? latest.lux} lx`
      }
      const hasSuhu =
        (latest.suhu !== undefined && latest.suhu !== null) ||
        (latest.temperature !== undefined && latest.temperature !== null)
      if (hasSuhu) {
        temperature = `${latest.suhu ?? latest.temperature}°C`
      }
      if (latest.dicatat_pada) {
        lastSeen = new Date(latest.dicatat_pada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }
    }

    // Sinkronisasi status koneksi lampu dari status lampu
    let deviceStatus = rawBlock.deviceStatus
    let jumlah_lampu = rawBlock.jumlah_lampu
    let watt_terpasang = rawBlock.watt_terpasang

    if (statusLampu) {
      if (statusLampu.nodes && statusLampu.nodes.length > 0) {
        const matchedNode =
          statusLampu.nodes.find((n) => n.id_sensor === effectiveSensorId || n.kode_perangkat === deviceId) ||
          statusLampu.nodes[0]
        if (matchedNode) {
          if (matchedNode.status === 'online') {
            deviceStatus = 'Online'
          } else if (matchedNode.status === 'offline') {
            deviceStatus = 'Offline'
          } else if (matchedNode.status === 'belum_pernah_terlihat') {
            deviceStatus = 'Belum Terpasang'
          } else {
            deviceStatus = matchedNode.status_online ? 'Online' : 'Offline'
          }
          if (matchedNode.terakhir_terlihat !== undefined && matchedNode.terakhir_terlihat) {
            lastSeen = matchedNode.terakhir_terlihat
          }
        }
      }
      jumlah_lampu = statusLampu.jumlah_lampu
      watt_terpasang = statusLampu.watt_terpasang
    }

    return {
      ...rawBlock,
      deviceId,
      nodeSensorId: effectiveSensorId,
      deviceStatus,
      currentLux,
      temperature,
      gateway: gatewayName,
      lastSeen,
      lightingSchedule,
      energyConsumption: {
        kwh: energyData?.total_kwh ?? rawBlock.energyConsumption.kwh,
        period: 'Bulan Ini',
      },
      sensorLogs,
      jumlah_lampu,
      watt_terpasang,
    }
  }, [
    rawBlock,
    activeNode,
    gatewayData,
    activeSchedule,
    telemetryData,
    energyData,
    statusLampu,
    effectiveSensorId,
  ])

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchBlock(),
      refetchLampu(),
      refetchTelemetri(),
      refetchEnergy(),
    ])
  }, [refetchBlock, refetchLampu, refetchTelemetri, refetchEnergy])

  return {
    data,
    statusLampu,
    telemetryData,
    energyData,
    activeNode: activeNode ?? null,
    isLoading: isValidBlock && isLoadingBlock,
    error: blockError ? (blockError as Error).message : null,
    telemetryRange,
    setTelemetryRange,
    refetch,
  }
}
