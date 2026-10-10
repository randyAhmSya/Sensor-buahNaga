import type { FarmItem } from '@/types/farm.types'
import type { BlockItem } from '@/types/block.types'

export type { FarmItem, BlockItem }
export type FarmDetail = FarmItem

export const MOCK_FARMS: FarmItem[] = []

export const MOCK_FARMS_LIST = MOCK_FARMS

export const getAllFarms = (): FarmItem[] => MOCK_FARMS

export const getFarmById = (id: string): FarmItem | undefined =>
  MOCK_FARMS.find((f) => f.id === id)

export const getBlocksByFarmId = (farmId: string): BlockItem[] => {
  const farm = MOCK_FARMS.find((f) => f.id === farmId)
  return farm ? farm.blocks : []
}
