import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FarmItem } from '@/types/farm.types'
import { farmService } from '@/services/farmService'
import { blockService } from '@/services/blockService'
import { useFarmsQuery } from '@/hooks/queries/useFarmsQuery'
import { farmKeys, blockKeys } from '@/services/queryKeys'
import type { ToastType } from '@/components/feedback/Toast'
import { useNotify } from '@/context/NotificationContext'

export interface FarmFilterToast {
  type: ToastType
  title: string
  message?: string
}

export const useFarmFilter = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const notify = useNotify()

  const { data: farms = [], isLoading, refetch } = useFarmsQuery()

  const [selectedFarmId, setSelectedFarmId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('Semua')
  const [toast, setToast] = useState<FarmFilterToast | null>(null)

  // Tangani flash toast dari navigasi (misal setelah edit / create kebun)
  useEffect(() => {
    const stateToast = (location.state as { toast?: FarmFilterToast })?.toast
    if (stateToast) {
      if (stateToast.type === 'success') {
        notify.success(stateToast.title, stateToast.message)
      } else if (stateToast.type === 'error') {
        notify.error(stateToast.title, stateToast.message)
      } else if (stateToast.type === 'warning') {
        notify.warning(stateToast.title, stateToast.message)
      } else {
        notify.info(stateToast.title, stateToast.message)
      }
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate, notify])

  // Inisialisasi selectedFarmId saat farms berhasil dimuat
  useEffect(() => {
    if (farms.length > 0) {
      setSelectedFarmId((prev) => (prev && farms.some((f) => f.id === prev) ? prev : farms[0].id))
    } else {
      setSelectedFarmId('')
    }
  }, [farms])

  const deleteFarm = async (id: string, name: string): Promise<boolean> => {
    try {
      await farmService.delete(id)
      queryClient.setQueryData<FarmItem[]>(['kebun'], (old = []) => old.filter((f) => f.id !== id))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.detail(id), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
      ])

      notify.success(
        'Kebun Berhasil Dihapus',
        `Kebun "${name}" beserta data blok terkait telah berhasil dihapus.`
      )
      return true
    } catch (err: unknown) {
      notify.error(
        'Gagal Menghapus Kebun',
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus kebun.'
      )
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

  const { data: selectedFarmBlocks = [] } = useQuery({
    queryKey: blockKeys.list(selectedFarmId),
    queryFn: () => blockService.getBlocksByFarmId(selectedFarmId),
    enabled: Boolean(selectedFarmId && selectedFarmId.trim()),
    staleTime: 30_000,
  })

  const selectedFarm = useMemo(() => {
    const base = selectedFarmId ? farms.find((f) => f.id === selectedFarmId) : farms[0]
    if (!base) return null
    return { ...base, blocks: selectedFarmBlocks }
  }, [farms, selectedFarmId, selectedFarmBlocks])

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
    updateFarmInState: (updated?: FarmItem) => {
      if (updated?.id) {
        queryClient.setQueryData<FarmItem[]>(['kebun'], (old = []) =>
          old.map((f) => (f.id === updated.id ? updated : f))
        )
      }
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
        updated?.id
          ? queryClient.invalidateQueries({ queryKey: farmKeys.detail(updated.id), refetchType: 'all' })
          : Promise.resolve(),
      ])
    },
    refetch,
  }
}

export const useFarms = useFarmFilter
