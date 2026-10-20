import { useState, useEffect, useCallback, useRef } from 'react'
import type { BlockDetailFull, BlokStatusLampuResponse } from '@/types/block.types'
import type { NodeSensorBackend } from '@/types/node.types'
import { blockService } from '@/services/blockService'
import { nodeService } from '@/services/nodeService'
import { fetchTelemetri, type ReadSensor } from '@/services/telemetryService'
import { fetchLogEnergy, type EnergyLogResponse } from '@/services/energyService'
import type { TimeFilter } from '../components/detail/RealtimeChartSection'

export const useBlockDetail = (farmId: string, blockId: string) => {
  const [data, setData] = useState<BlockDetailFull | null>(null)
  const [statusLampu, setStatusLampu] = useState<BlokStatusLampuResponse | null>(null)
  const [telemetryData, setTelemetryData] = useState<ReadSensor[]>([])
  const [energyData, setEnergyData] = useState<EnergyLogResponse | null>(null)
  const [activeNode, setActiveNode] = useState<NodeSensorBackend | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [telemetryRange, setTelemetryRange] = useState<TimeFilter>('24 Jam')

  const lastFetchKeyRef = useRef<string>('')

  const fetchBlock = useCallback(
    async (force = false) => {
      const cleanBlockId = (blockId || '').trim()
      const cleanFarmId = (farmId && farmId !== 'farm-1' && farmId !== 'undefined' ? farmId : '').trim()

      if (!cleanBlockId || cleanBlockId === 'blk-1') {
        setIsLoading(false)
        setData(null)
        setTelemetryData([])
        setEnergyData(null)
        setActiveNode(null)
        return
      }

      const fetchKey = `${cleanFarmId}:${cleanBlockId}`

      // Cegah duplikasi pemanggilan request jika kombinasi farmId dan blockId yang sama sudah diambil
      if (!force && lastFetchKeyRef.current === fetchKey) {
        return
      }

      lastFetchKeyRef.current = fetchKey
      setIsLoading(true)
      setError(null)

      try {
        // 1. Ambil data detail blok dasar
        const result = await blockService.getById(cleanFarmId, cleanBlockId)
        if (!result) {
          setData(null)
          setTelemetryData([])
          setEnergyData(null)
          setActiveNode(null)
          return
        }

        const effectiveFarmId = result.farmId || cleanFarmId

        // 2. Dapatkan activeNode dari blok aktif (sensor.blok_id === blockId)
        let foundNode: NodeSensorBackend | null = null
        if (effectiveFarmId) {
          const allNodes = await nodeService.getAll(effectiveFarmId).catch(() => [])
          foundNode =
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
        }

        const targetSensorId = foundNode?.id_sensor || result.nodeSensorId
        setActiveNode(foundNode)

        // 3. Jika activeNode ditemukan, panggil endpoint riil; jika tidak, HINDARI memanggil endpoint
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

        setTelemetryData(telemetriList)
        setEnergyData(logEnergyResult)

        // Perbarui data blok dengan telemetri dan log energi riil
        const updatedResult: BlockDetailFull = {
          ...result,
          energyConsumption: {
            ...result.energyConsumption,
            kwh: logEnergyResult.total_kwh,
          },
        }

        if (telemetriList.length > 0) {
          const latest = telemetriList[telemetriList.length - 1]
          if (latest.nilai_lux !== undefined || latest.lux !== undefined) {
            updatedResult.currentLux = `${latest.nilai_lux ?? latest.lux} lx`
          }
          if (latest.suhu !== undefined || latest.temperature !== undefined) {
            updatedResult.temperature = `${latest.suhu ?? latest.temperature}°C`
          }
          if (latest.dicatat_pada) {
            updatedResult.lastSeen = new Date(latest.dicatat_pada).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })
          }
        }

        // 4. Ambil status lampu blok
        const resLampu = await blockService.getStatusLampu(cleanBlockId).catch(() => null)
        setStatusLampu(resLampu)

        setData(updatedResult)
      } catch (err: unknown) {
        setError((err as Error)?.message || 'Gagal memuat detail blok')
      } finally {
        setIsLoading(false)
      }
    },
    [farmId, blockId]
  )

  // Dependency array terproteksi: HANYA dipicu saat farmId atau blockId berubah
  useEffect(() => {
    fetchBlock()
  }, [farmId, blockId, fetchBlock])

  return {
    data,
    statusLampu,
    telemetryData,
    energyData,
    activeNode,
    isLoading,
    error,
    telemetryRange,
    setTelemetryRange,
    refetch: () => fetchBlock(true),
  }
}
