import { useState, useEffect, useMemo, useCallback } from 'react'
import type { SensorNodeItem, SensorSummaryMetrics } from '@/types/sensor.types'
import { sensorService } from '@/services/sensorService'

export const useSensorMonitoring = () => {
  const [summaryMetrics, setSummaryMetrics] = useState<SensorSummaryMetrics>({
    totalNodes: 0,
    onlineNodes: 0,
    offlineNodes: 0,
  })
  const [sensors, setSensors] = useState<SensorNodeItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarm, setSelectedFarm] = useState('Semua Kebun')
  const [selectedStatus, setSelectedStatus] = useState('Semua Status')
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [summary, nodes] = await Promise.all([
        sensorService.getSummary(),
        sensorService.getAll(),
      ])
      setSummaryMetrics(summary)
      setSensors(nodes)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    Promise.all([sensorService.getSummary(), sensorService.getAll()]).then(([summary, nodes]) => {
      if (isMounted) {
        setSummaryMetrics(summary)
        setSensors(nodes)
        setIsLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredSensors = useMemo(() => {
    return sensors.filter((node) => {
      const matchSearch = node.nodeCode.toLowerCase().includes(searchTerm.toLowerCase())
      const matchFarm = selectedFarm === 'Semua Kebun' || node.farmName === selectedFarm
      const matchStatus = selectedStatus === 'Semua Status' || node.status === selectedStatus
      return matchSearch && matchFarm && matchStatus
    })
  }, [sensors, searchTerm, selectedFarm, selectedStatus])

  return {
    summaryMetrics,
    sensors,
    filteredSensors,
    searchTerm,
    setSearchTerm,
    selectedFarm,
    setSelectedFarm,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    refetch: loadData,
  }
}
