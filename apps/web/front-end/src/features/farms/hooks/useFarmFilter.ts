import { useState, useEffect, useMemo, useCallback } from 'react'
import type { FarmItem } from '@/types/farm.types'
import { farmService } from '@/services/farmService'

export const useFarmFilter = () => {
  const [farms, setFarms] = useState<FarmItem[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-1')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('Semua')
  const [isLoading, setIsLoading] = useState(true)

  const loadFarms = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await farmService.getAll()
      setFarms(data)
      if (data.length > 0 && !data.some((f) => f.id === selectedFarmId)) {
        setSelectedFarmId(data[0].id)
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedFarmId])

  useEffect(() => {
    let isMounted = true
    farmService.getAll().then((data) => {
      if (isMounted) {
        setFarms(data)
        if (data.length > 0 && !data.some((f) => f.id === selectedFarmId)) {
          setSelectedFarmId(data[0].id)
        }
        setIsLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [selectedFarmId])

  const filteredFarms = useMemo(() => {
    return farms.filter((farm) => {
      const matchSearch =
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'Semua' || farm.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [farms, searchTerm, statusFilter])

  const selectedFarm = useMemo(() => {
    return farms.find((f) => f.id === selectedFarmId) || farms[0] || null
  }, [farms, selectedFarmId])

  const stats = useMemo(() => {
    const totalFarms = farms.length
    const activeFarms = farms.filter((f) => f.status === 'Aktif').length
    const totalBlocks = farms.reduce((acc, curr) => acc + (curr.blocks?.length || 0), 0)
    return { totalFarms, activeFarms, totalBlocks }
  }, [farms])

  return {
    farms,
    filteredFarms,
    selectedFarmId,
    setSelectedFarmId,
    selectedFarm,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    stats,
    isLoading,
    refetch: loadFarms,
  }
}

export const useFarms = useFarmFilter
