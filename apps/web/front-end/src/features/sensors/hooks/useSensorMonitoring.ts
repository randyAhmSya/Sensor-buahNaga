import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { SensorNodeItem, SensorSummaryMetrics } from '@/types/sensor.types'
import type { FarmItem } from '@/types/farm.types'
import type { CreateNodePayload } from '@/types/node.types'
import { sensorService, mapNodeToSensorItem } from '@/services/sensorService'
import { farmService } from '@/services/farmService'
import type { EditSensorFormData } from '../components/EditSensorModal'

export interface SensorToast {
  type: 'success' | 'error'
  message: string
}

export const useSensorMonitoring = () => {
  const [sensors, setSensors] = useState<SensorNodeItem[]>([])
  const [farms, setFarms] = useState<FarmItem[]>([])
  const [farmOptions, setFarmOptions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('Semua Kebun')
  const [selectedStatus, setSelectedStatus] = useState('Semua Status')
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [toast, setToast] = useState<SensorToast | null>(null)
  const hasLoadedRef = useRef(false)

  const clearToast = useCallback(() => setToast(null), [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [nodes, farmsData] = await Promise.all([
        sensorService.getAll(),
        farmService.getAll(),
      ])
      setSensors(nodes)
      setFarms(farmsData || [])
      const names = (farmsData || []).map((f) => f.name).filter(Boolean)
      setFarmOptions(names)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    loadData()
  }, [loadData])

  // Hitung ringkasan metrik statistik secara dinamis berdasarkan data sensor aktif
  const summaryMetrics = useMemo<SensorSummaryMetrics>(() => {
    const totalNodes = sensors.length
    const onlineNodes = sensors.filter(
      (s) => s.status?.toLowerCase() === 'aktif' || s.status?.toLowerCase() === 'online'
    ).length
    const offlineNodes = totalNodes - onlineNodes
    return { totalNodes, onlineNodes, offlineNodes }
  }, [sensors])

  // Filter pencarian dan dropdown
  const filteredSensors = useMemo(() => {
    return sensors.filter((node) => {
      const matchSearch =
        node.nodeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.farmName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchFarm = selectedFarm === 'Semua Kebun' || node.farmName === selectedFarm
      const isNodeActive =
        node.status?.toLowerCase() === 'aktif' || node.status?.toLowerCase() === 'online'
      const matchStatus =
        selectedStatus === 'Semua Status' ||
        (selectedStatus === 'Aktif' || selectedStatus === 'Online' ? isNodeActive : !isNodeActive)
      return matchSearch && matchFarm && matchStatus
    })
  }, [sensors, searchTerm, selectedFarm, selectedStatus])

  // Aksi Tambah Sensor ke Backend
  const createSensor = useCallback(
    async (payload: CreateNodePayload) => {
      setIsActionLoading(true)
      try {
        const res = await sensorService.create(payload)
        const newNodeData = res?.data
        if (newNodeData) {
          const mapped = mapNodeToSensorItem(newNodeData)
          setSensors((prev) => [mapped, ...prev])
        } else {
          await loadData()
        }

        setToast({
          type: 'success',
          message: `Node sensor ${payload.kode_perangkat} berhasil didaftarkan.`,
        })
      } catch (err: unknown) {
        setToast({
          type: 'error',
          message: (err as Error)?.message || 'Gagal mendaftarkan sensor baru di server.',
        })
        throw err
      } finally {
        setIsActionLoading(false)
      }
    },
    [loadData]
  )

  // Aksi Edit Sensor ke Backend
  const editSensor = useCallback(
    async (sensorId: string, data: EditSensorFormData) => {
      setIsActionLoading(true)
      try {
        await sensorService.update(sensorId, {
          kode_perangkat: data.nodeCode,
          blok_id: data.blockId || null,
          gateway_id: data.gatewayId || null,
          status_koneksi: data.status.toLowerCase(),
          tipe_sensor: data.tipeSensor,
        })

        await loadData()

        setToast({
          type: 'success',
          message: `Sensor ${data.nodeCode} berhasil diperbarui.`,
        })
      } catch (err: unknown) {
        setToast({
          type: 'error',
          message: (err as Error)?.message || 'Gagal memperbarui data sensor di server.',
        })
        throw err
      } finally {
        setIsActionLoading(false)
      }
    },
    [loadData]
  )

  // Aksi Hapus Sensor ke Backend
  const deleteSensor = useCallback(
    async (sensorId: string, nodeCode: string) => {
      setIsActionLoading(true)
      try {
        await sensorService.delete(sensorId)

        // Hapus sensor dari state UI reaktif
        setSensors((prev) => prev.filter((item) => item.id !== sensorId))

        setToast({
          type: 'success',
          message: `Sensor ${nodeCode} berhasil dihapus dari sistem.`,
        })
      } catch (err: unknown) {
        setToast({
          type: 'error',
          message: (err as Error)?.message || 'Gagal menghapus sensor di server.',
        })
        throw err
      } finally {
        setIsActionLoading(false)
      }
    },
    []
  )

  return {
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
    toast,
    clearToast,
    refetch: loadData,
    createSensor,
    editSensor,
    deleteSensor,
  }
}
