import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { FarmItem } from '@/types/farm.types'
import { farmService } from '@/services/farmService'
import { blockService } from '@/services/blockService'
import type { ToastType } from '@/components/feedback/Toast'

export interface FarmFilterToast {
  type: ToastType
  title: string
  message?: string
}

export const useFarmFilter = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [farms, setFarms] = useState<FarmItem[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('Semua')
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<FarmFilterToast | null>(null)

  // Tangani flash toast dari navigasi (misal setelah edit / create kebun)
  useEffect(() => {
    const stateToast = (location.state as { toast?: FarmFilterToast })?.toast
    if (stateToast) {
      setToast(stateToast)
      // Bersihkan state riwayat browser agar toast tidak muncul berulang saat refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const loadFarms = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await farmService.getAll()
      setFarms(data)
      if (data.length > 0) {
        setSelectedFarmId((prev) => (prev && data.some((f) => f.id === prev) ? prev : data[0].id))
      } else {
        setSelectedFarmId('')
      }
    } catch {
      setFarms([])
      setSelectedFarmId('')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFarms()
  }, [loadFarms])

  // Pastikan blok kebun terpilih disinkronisasi HANYA jika selectedFarmId valid dan bukan dummy
  useEffect(() => {
    if (
      !selectedFarmId ||
      typeof selectedFarmId !== 'string' ||
      !selectedFarmId.trim() ||
      selectedFarmId === 'farm-1' ||
      selectedFarmId === 'undefined' ||
      selectedFarmId === 'null'
    ) {
      return
    }
    let isMounted = true

    blockService
      .getBlocksByFarmId(selectedFarmId.trim())
      .then((blocks) => {
        if (!isMounted) return
        setFarms((prev) =>
          prev.map((farm) => {
            if (farm.id === selectedFarmId) {
              return {
                ...farm,
                blocks: blocks,
                totalBlocks: blocks.length,
              }
            }
            return farm
          })
        )
      })
      .catch(() => {
        // Jangan timpa jika gagal
      })

    return () => {
      isMounted = false
    }
  }, [selectedFarmId])

  const deleteFarm = async (id: string, name: string): Promise<boolean> => {
    try {
      await farmService.delete(id)
      setFarms((prev) => {
        const remaining = prev.filter((f) => f.id !== id)
        if (selectedFarmId === id) {
          setSelectedFarmId(remaining.length > 0 ? remaining[0].id : '')
        }
        return remaining
      })
      setToast({
        type: 'success',
        title: 'Kebun Berhasil Dihapus',
        message: `Kebun "${name}" beserta data blok terkait telah berhasil dihapus.`,
      })
      return true
    } catch (err: unknown) {
      setToast({
        type: 'error',
        title: 'Gagal Menghapus Kebun',
        message: err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus kebun.',
      })
      return false
    }
  }

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
    if (!selectedFarmId) return farms[0] || null
    return farms.find((f) => f.id === selectedFarmId) || null
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
    toast,
    setToast,
    clearToast: () => setToast(null),
    deleteFarm,
    updateFarmInState: (updated: FarmItem) => {
      setFarms((prev) => prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)))
    },
    refetch: loadFarms,
  }
}

export const useFarms = useFarmFilter
