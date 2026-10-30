import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { BlockDetailFull, BlokStatusLampuResponse } from '@/types/block.types'
import type { NodeSensorBackend } from '@/types/node.types'
import { blockService } from '@/services/blockService'
import { nodeService } from '@/services/nodeService'
import { fetchTelemetri, type ReadSensor } from '@/services/telemetryService'
import { fetchLogEnergy, type EnergyLogResponse } from '@/services/energyService'
import { blockKeys } from '@/services/queryKeys'
import type { TimeFilter } from '../components/detail/RealtimeChartSection'

interface BlockDetailAggregated {
  data: BlockDetailFull | null
  statusLampu: BlokStatusLampuResponse | null
  telemetryData: ReadSensor[]
  energyData: EnergyLogResponse | null
  activeNode: NodeSensorBackend | null
}

export const useBlockDetail = (farmId: string, blockId: string) => {
  const [telemetryRange, setTelemetryRange] = useState<TimeFilter>('24 Jam')

  const cleanBlockId = (blockId || '').trim()
  const cleanFarmId = (farmId && farmId !== 'farm-1' && farmId !== 'undefined' ? farmId : '').trim()

  const isValidBlock = Boolean(cleanBlockId && cleanBlockId !== 'blk-1')

  const {
    data: aggregate,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<BlockDetailAggregated>({
    queryKey: blockKeys.detail(cleanBlockId),
    queryFn: async (): Promise<BlockDetailAggregated> => {
      // 1. Eksekusi permintaan independen secara paralel (eliminasi waterfall)
      const [rawBlock, resLampu, allNodes] = await Promise.all([
        blockService.getById(cleanFarmId, cleanBlockId),
        blockService.getStatusLampu(cleanBlockId).catch(() => null),
        cleanFarmId ? nodeService.getAll(cleanFarmId).catch(() => []) : Promise.resolve([]),
      ])

      if (!rawBlock) {
        return {
          data: null,
          statusLampu: null,
          telemetryData: [],
          energyData: null,
          activeNode: null,
        }
      }

      // 2. Temukan activeNode yang terkait dengan blok ini
      const foundNode =
        allNodes.find((sensor) => {
          const raw = sensor as unknown as Record<string, unknown>
          return (
            (sensor.blok_id && String(sensor.blok_id).trim() === cleanBlockId) ||
            (raw.id_blok && String(raw.id_blok).trim() === cleanBlockId) ||
            (raw.block_id && String(raw.block_id).trim() === cleanBlockId) ||
            (sensor.blok?.id_blok && String(sensor.blok.id_blok).trim() === cleanBlockId) ||
            (sensor.blok?.id && String(sensor.blok.id).trim() === cleanBlockId)
          )
        }) || null

      const targetSensorId = foundNode?.id_sensor || rawBlock.nodeSensorId

      // 3. Eksekusi telemetri dan log energi secara paralel jika sensor terpasang
      let telemetriList: ReadSensor[] = []
      let logEnergyResult: EnergyLogResponse = { total_kwh: 0, riwayat: [] }

      if (targetSensorId && targetSensorId.trim() && targetSensorId !== 'Belum Terpasang') {
        const [resTele, resEnergy] = await Promise.all([
          fetchTelemetri(targetSensorId, 100).catch(() => []),
          fetchLogEnergy(targetSensorId, 100).catch(() => ({ total_kwh: 0, riwayat: [] })),
        ])
        telemetriList = resTele
        logEnergyResult = resEnergy
      }

      // 4. Perbarui data blok dengan telemetri dan konsumsi energi riil
      const updatedResult: BlockDetailFull = {
        ...rawBlock,
        energyConsumption: {
          ...rawBlock.energyConsumption,
          kwh: logEnergyResult.total_kwh,
        },
      }

      if (telemetriList.length > 0) {
        const latest = telemetriList[telemetriList.length - 1]
        if (latest.nilai_lux !== undefined || latest.lux !== undefined) {
          updatedResult.currentLux = `${latest.nilai_lux ?? latest.lux} lx`
        }
        const hasSuhu =
          (latest.suhu !== undefined && latest.suhu !== null) ||
          (latest.temperature !== undefined && latest.temperature !== null)
        if (hasSuhu) {
          updatedResult.temperature = `${latest.suhu ?? latest.temperature}°C`
        } else {
          updatedResult.temperature = ''
        }
        if (latest.dicatat_pada) {
          updatedResult.lastSeen = latest.dicatat_pada
        }
      }

      // 5. Sinkronisasi status koneksi lampu dari status lampu
      if (resLampu && resLampu.nodes && resLampu.nodes.length > 0) {
        const matchedNode =
          resLampu.nodes.find((n) => n.id_sensor === updatedResult.deviceId) ||
          resLampu.nodes[0]
        if (matchedNode) {
          if (matchedNode.status === 'online') {
            updatedResult.deviceStatus = 'Online'
          } else if (matchedNode.status === 'offline') {
            updatedResult.deviceStatus = 'Offline'
          } else if (matchedNode.status === 'belum_pernah_terlihat') {
            updatedResult.deviceStatus = 'Belum Terpasang'
          } else {
            updatedResult.deviceStatus = matchedNode.status_online ? 'Online' : 'Offline'
          }
          if (matchedNode.terakhir_terlihat !== undefined) {
            updatedResult.lastSeen = matchedNode.terakhir_terlihat || 'Belum ada data'
          }
        }
      }

      return {
        data: updatedResult,
        statusLampu: resLampu,
        telemetryData: telemetriList,
        energyData: logEnergyResult,
        activeNode: foundNode,
      }
    },
    enabled: isValidBlock,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })

  return {
    data: aggregate?.data ?? null,
    statusLampu: aggregate?.statusLampu ?? null,
    telemetryData: aggregate?.telemetryData ?? [],
    energyData: aggregate?.energyData ?? null,
    activeNode: aggregate?.activeNode ?? null,
    isLoading: isValidBlock && isLoading,
    error: queryError ? (queryError as Error).message : null,
    telemetryRange,
    setTelemetryRange,
    refetch,
  }
}
