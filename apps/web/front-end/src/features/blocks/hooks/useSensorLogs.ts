import { useState, useEffect, useCallback } from 'react'
import type { SensorLogItem } from '@/types/block.types'
import { blockService } from '@/services/blockService'

export const useSensorLogs = (blockId: string, initialRange: string = '1 Jam Terakhir') => {
  const [logs, setLogs] = useState<SensorLogItem[]>([])
  const [rangeFilter, setRangeFilter] = useState(initialRange)
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const items = await blockService.getSensorLogs(blockId, rangeFilter)
      setLogs(items)
    } finally {
      setIsLoading(false)
    }
  }, [blockId, rangeFilter])

  useEffect(() => {
    let isMounted = true
    blockService.getSensorLogs(blockId, rangeFilter).then((items) => {
      if (isMounted) {
        setLogs(items)
        setIsLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [blockId, rangeFilter])

  return {
    logs,
    rangeFilter,
    setRangeFilter,
    isLoading,
    refetch: fetchLogs,
  }
}
