import { useState, useEffect, useCallback, useRef } from 'react'
import type { BlockDetailFull } from '@/types/block.types'
import { blockService } from '@/services/blockService'
import type { TimeFilter } from '../components/detail/RealtimeChartSection'

export const useBlockDetail = (farmId: string, blockId: string) => {
  const [data, setData] = useState<BlockDetailFull | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [telemetryRange, setTelemetryRange] = useState<TimeFilter>('24 Jam')

  const lastFetchedIdRef = useRef<string>('')

  const fetchBlock = useCallback(
    async (force = false) => {
      const cleanBlockId = blockId ? blockId.trim() : ''
      if (!cleanBlockId || cleanBlockId === 'blk-1') {
        setIsLoading(false)
        setData(null)
        return
      }

      // Cegah duplikasi pemanggilan request jika blockId yang sama sudah diambil
      if (!force && lastFetchedIdRef.current === cleanBlockId) {
        return
      }

      lastFetchedIdRef.current = cleanBlockId
      setIsLoading(true)
      setError(null)
      try {
        const result = await blockService.getById(farmId || '', cleanBlockId)
        setData(result)
      } catch (err: unknown) {
        setError((err as Error)?.message || 'Gagal memuat detail blok')
      } finally {
        setIsLoading(false)
      }
    },
    [farmId, blockId]
  )

  // Dependency array dirapikan: HANYA dipicu saat blockId berubah
  useEffect(() => {
    fetchBlock()
  }, [blockId])

  return {
    data,
    isLoading,
    error,
    telemetryRange,
    setTelemetryRange,
    refetch: () => fetchBlock(true),
  }
}
