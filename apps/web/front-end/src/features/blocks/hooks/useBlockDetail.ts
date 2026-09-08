import { useState, useEffect, useCallback } from 'react'
import type { BlockDetailFull } from '@/types/block.types'
import { blockService } from '@/services/blockService'
import type { TimeFilter } from '../components/detail/RealtimeChartSection'

export const useBlockDetail = (farmId: string, blockId: string) => {
  const [data, setData] = useState<BlockDetailFull | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [telemetryRange, setTelemetryRange] = useState<TimeFilter>('24 Jam')

  const fetchBlock = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await blockService.getById(farmId, blockId)
      setData(result)
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Gagal memuat detail blok')
    } finally {
      setIsLoading(false)
    }
  }, [farmId, blockId])

  useEffect(() => {
    let isMounted = true
    blockService
      .getById(farmId, blockId)
      .then((result) => {
        if (isMounted) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError((err as Error)?.message || 'Gagal memuat detail blok')
          setIsLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [farmId, blockId])

  return {
    data,
    isLoading,
    error,
    telemetryRange,
    setTelemetryRange,
    refetch: fetchBlock,
  }
}
