import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { SensorNodeItem, SensorSummaryMetrics } from '@/types/sensor.types'
import type { CreateNodePayload } from '@/types/node.types'
import { sensorService } from '@/services/sensorService'
import { blockService } from '@/services/blockService'
import { useFarmsWithBlocksQuery } from '@/hooks/queries/useFarmsQuery'
import { sensorKeys, blockKeys, farmKeys } from '@/services/queryKeys'
import type { BlokStatusLampuResponse } from '@/types/block.types'
import type { EditSensorFormData } from '../components/EditSensorModal'
import { useNotify } from '@/context/NotificationContext'

export const useSensorMonitoring = () => {
  const params = useParams<{ sensorId?: string; id?: string }>()
  const routeSensorId = params.sensorId ?? params.id
  const queryClient = useQueryClient()
  const notify = useNotify()

  const [searchTerm, setSearchTerm] = useState(routeSensorId || '')
  const [selectedFarm, setSelectedFarm] = useState('Semua Kebun')
  const [selectedStatus, setSelectedStatus] = useState('Semua Status')
  const [isActionLoading, setIsActionLoading] = useState(false)

  // 1. Shared Query Farms With Blocks (Daftar kebun beserta blok riil untuk dropdown modal)
  const { data: farms = [] } = useFarmsWithBlocksQuery()
  const activeFarmId = farms[0]?.id

  // 2. Query Utama Monitoring Sensor (Single Screen-Level Polling 30s saat tab aktif)
  const {
    data: sensors = [],
    isLoading: isSensorsLoading,
    refetch,
  } = useQuery<SensorNodeItem[]>({
    queryKey: sensorKeys.list(activeFarmId),
    queryFn: async (): Promise<SensorNodeItem[]> => {
      const nodes = await sensorService.getAll(activeFarmId)

      // Ambil blockId unik untuk sinkronisasi status-lampu secara paralel
      const uniqueBlockIds = Array.from(
        new Set(nodes.map((n) => n.blockId).filter(Boolean))
      )

      const statusMap = new Map<string, BlokStatusLampuResponse>()

      const fetchPromises = uniqueBlockIds.map(async (bId) => {
        try {
          const res = await blockService.getStatusLampu(bId)
          if (res) {
            statusMap.set(bId, res)
          }
        } catch {
          // Abaikan jika blok belum memiliki konfigurasi status lampu
        }
      })

      await Promise.allSettled(fetchPromises)

      // Bangun lookup map untuk status node
      const nodeStatusLookup = new Map<
        string,
        { status: 'online' | 'offline' | 'belum_pernah_terlihat'; terakhir_terlihat: string | null }
      >()

      for (const statusRes of statusMap.values()) {
        for (const n of statusRes.nodes || []) {
          const nodeStatus: 'online' | 'offline' | 'belum_pernah_terlihat' =
            n.status || (n.status_online ? 'online' : 'offline')
          if (n.id_sensor) {
            nodeStatusLookup.set(n.id_sensor, {
              status: nodeStatus,
              terakhir_terlihat: n.terakhir_terlihat,
            })
          }
          if (n.kode_perangkat) {
            nodeStatusLookup.set(n.kode_perangkat, {
              status: nodeStatus,
              terakhir_terlihat: n.terakhir_terlihat,
            })
          }
        }
      }

      // Sinkronisasikan status riil dari status-lampu ke tiap node sensor
      return nodes.map((node) => {
        const lookup =
          nodeStatusLookup.get(node.id) || nodeStatusLookup.get(node.nodeCode)

        const status =
          lookup?.status ||
          (node.status?.toLowerCase() === 'aktif' || node.status?.toLowerCase() === 'online'
            ? 'online'
            : 'offline')

        const lastSeen = lookup?.terakhir_terlihat || node.lastSeen || 'Belum ada data'

        return {
          ...node,
          status,
          lastSeen,
        }
      })
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })

  // Dropdown Opsi Kebun (Deduplikasi ketat)
  const farmOptions = useMemo(() => {
    const list = Array.from(new Set(farms.map((f) => f.name?.trim()).filter(Boolean)))
    return ['Semua Kebun', ...list.filter((name) => name !== 'Semua Kebun')]
  }, [farms])

  // Sensor dengan Pemetaan Nama Kebun Riil
  const sensorsWithRealFarm = useMemo<SensorNodeItem[]>(() => {
    const blockIdToFarmName = new Map<string, string>()
    const blockNameToFarmName = new Map<string, string>()
    const farmIdToName = new Map<string, string>()

    farms.forEach((f) => {
      if (f.id) farmIdToName.set(String(f.id), f.name)
      if (f.id_kebun) farmIdToName.set(String(f.id_kebun), f.name)
      f.blocks?.forEach((b) => {
        if (b.id) blockIdToFarmName.set(String(b.id), f.name)
        if (b.id_blok) blockIdToFarmName.set(String(b.id_blok), f.name)
        if (b.name) blockNameToFarmName.set(b.name.trim().toLowerCase(), f.name)
      })
    })

    const primaryFarmName = farms[0]?.name

    return sensors.map((sensor) => {
      const matchedByBlockId = sensor.blockId ? blockIdToFarmName.get(String(sensor.blockId)) : undefined
      const matchedByFarmId = sensor.farmId ? farmIdToName.get(String(sensor.farmId)) : undefined
      const matchedByBlockName = sensor.blockName ? blockNameToFarmName.get(sensor.blockName.trim().toLowerCase()) : undefined
      const hasValidCustomName = sensor.farmName && sensor.farmName !== 'Kebun Buah Naga'

      const resolvedFarmName =
        matchedByBlockId ||
        matchedByFarmId ||
        matchedByBlockName ||
        (hasValidCustomName ? sensor.farmName : undefined) ||
        primaryFarmName ||
        'Kebun Buah Naga'

      return {
        ...sensor,
        farmName: resolvedFarmName,
      }
    })
  }, [sensors, farms])

  // Ringkasan Metrik
  const summaryMetrics = useMemo<SensorSummaryMetrics>(() => {
    const totalNodes = sensorsWithRealFarm.length
    const onlineNodes = sensorsWithRealFarm.filter(
      (s) => s.status?.toLowerCase() === 'online'
    ).length
    const offlineNodes = sensorsWithRealFarm.filter(
      (s) => s.status?.toLowerCase() === 'offline'
    ).length
    const neverSeenNodes = sensorsWithRealFarm.filter(
      (s) => s.status === 'belum_pernah_terlihat'
    ).length

    return {
      totalNodes,
      onlineNodes,
      offlineNodes,
      neverSeenNodes,
    }
  }, [sensorsWithRealFarm])

  // Filter Sensors
  const filteredSensors = useMemo(() => {
    return sensorsWithRealFarm.filter((sensor) => {
      const farmName = sensor.farmName || ''
      const blockName = sensor.blockName || ''
      const tipeSensor = sensor.tipeSensor || ''

      const matchSearch =
        searchTerm === '' ||
        sensor.nodeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tipeSensor.toLowerCase().includes(searchTerm.toLowerCase())

      const matchFarm =
        selectedFarm === 'Semua Kebun' ||
        farmName.toLowerCase().includes(selectedFarm.toLowerCase())

      const nodeStatus = sensor.status?.toLowerCase()
      const matchStatus =
        selectedStatus === 'Semua Status' ||
        (selectedStatus === 'Online' && nodeStatus === 'online') ||
        (selectedStatus === 'Offline' && nodeStatus === 'offline') ||
        (selectedStatus === 'Belum Pernah Terhubung' && nodeStatus === 'belum_pernah_terlihat') ||
        (selectedStatus === 'belum_pernah_terlihat' && nodeStatus === 'belum_pernah_terlihat') ||
        (selectedStatus === 'Aktif' && nodeStatus === 'online') ||
        (selectedStatus === 'Nonaktif' && nodeStatus === 'offline')

      return matchSearch && matchFarm && matchStatus
    })
  }, [sensorsWithRealFarm, searchTerm, selectedFarm, selectedStatus])

  // Aksi Tambah Sensor
  const createSensor = useCallback(
    async (payload: CreateNodePayload) => {
      setIsActionLoading(true)
      try {
        const res = await sensorService.create(payload)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: sensorKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['nodes'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        ])

        notify.success('Registrasi Berhasil', `Node sensor ${payload.kode_perangkat} berhasil didaftarkan.`)
        return res
      } catch (err: unknown) {
        notify.error('Gagal mendaftarkan node', (err as Error)?.message || 'Terjadi kesalahan saat menyimpan perangkat di server.')
        throw err
      } finally {
        setIsActionLoading(false)
      }
    },
    [queryClient, notify]
  )

  // Aksi Edit Sensor
  const editSensor = useCallback(
    async (sensorId: string, data: EditSensorFormData) => {
      setIsActionLoading(true)
      try {
        await sensorService.update(sensorId, {
          kode_perangkat: data.nodeCode,
          gateway_id: data.gatewayId || null,
          status_koneksi: data.status.toLowerCase(),
          tipe_sensor: data.tipeSensor,
        })

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: sensorKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: sensorKeys.detail(sensorId), refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['nodes'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        ])

        notify.success('Data node diperbarui', `Perubahan konfigurasi ${data.nodeCode} tersimpan.`)
      } catch (err: unknown) {
        notify.error('Gagal memperbarui node', (err as Error)?.message || 'Gagal memperbarui data sensor di server.')
        throw err
      } finally {
        setIsActionLoading(false)
      }
    },
    [queryClient, notify]
  )

  // Aksi Hapus Sensor
  const deleteSensor = useCallback(
    async (sensorId: string, nodeCode: string) => {
      setIsActionLoading(true)
      try {
        await sensorService.delete(sensorId)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: sensorKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['nodes'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        ])

        notify.success('Node berhasil dihapus', `Perangkat ${nodeCode} telah dilepas dari sistem.`)
      } catch (err: unknown) {
        notify.error('Gagal menghapus node', (err as Error)?.message || 'Gagal menghapus sensor di server.')
        throw err
      } finally {
        setIsActionLoading(false)
      }
    },
    [queryClient, notify]
  )

  return {
    summaryMetrics,
    sensors: sensorsWithRealFarm,
    filteredSensors,
    farms,
    farmOptions,
    searchTerm,
    setSearchTerm,
    selectedFarm,
    setSelectedFarm,
    selectedStatus,
    setSelectedStatus,
    isLoading: isSensorsLoading,
    isActionLoading,
    refetch,
    createSensor,
    editSensor,
    deleteSensor,
  }
}
