import type { BlockDetailFull, SensorLogItem, BlockItem } from '@/types/block.types'
import { MOCK_BLOCK_DETAIL } from '@/data/mockBlockDetail'
import { MOCK_FARMS } from '@/data/mockFarms'

export interface CreateBlockPayload {
  name: string
  nodeSensor: string
  description: string
  imageUrl: string
  status: 'Online' | 'Offline'
  area?: string
  harvestEstimate?: string
}

export const blockService = {
  getById: async (farmId: string, blockId: string): Promise<BlockDetailFull> => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const farm = MOCK_FARMS.find((f) => f.id === farmId)
    const block = farm?.blocks.find((b) => b.id === blockId)

    return {
      ...MOCK_BLOCK_DETAIL,
      id: blockId,
      farmId: farmId || MOCK_BLOCK_DETAIL.farmId,
      farmName: farm ? farm.name : MOCK_BLOCK_DETAIL.farmName,
      name: block ? block.name : MOCK_BLOCK_DETAIL.name,
      area: block ? block.area : MOCK_BLOCK_DETAIL.area,
      deviceId: block ? block.nodeSensor : MOCK_BLOCK_DETAIL.deviceId,
      deviceStatus: block ? block.status : MOCK_BLOCK_DETAIL.deviceStatus,
      bannerUrl: block ? block.imageUrl : MOCK_BLOCK_DETAIL.bannerUrl,
    }
  },

  create: async (
    farmId: string,
    payload: CreateBlockPayload
  ): Promise<{ success: boolean; id: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const newBlockId = `blk-${Date.now()}`
    const targetFarm = MOCK_FARMS.find((f) => f.id === farmId)
    if (targetFarm) {
      targetFarm.blocks.push({
        id: newBlockId,
        name: payload.name,
        description: payload.description,
        area: payload.area ? `${payload.area} m²` : '0 m²',
        nodeSensor: payload.nodeSensor,
        status: payload.status,
        imageUrl: payload.imageUrl,
        harvestEstimate: payload.harvestEstimate || 'Menunggu jadwal',
      })
      targetFarm.totalBlocks = targetFarm.blocks.length
    }
    return { success: true, id: newBlockId }
  },

  update: async (
    farmId: string,
    blockId: string,
    payload: Partial<CreateBlockPayload>
  ): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const targetFarm = MOCK_FARMS.find((f) => f.id === farmId)
    if (targetFarm) {
      const blockIndex = targetFarm.blocks.findIndex((b) => b.id === blockId)
      if (blockIndex !== -1) {
        targetFarm.blocks[blockIndex] = {
          ...targetFarm.blocks[blockIndex],
          name: payload.name ?? targetFarm.blocks[blockIndex].name,
          description: payload.description ?? targetFarm.blocks[blockIndex].description,
          area: payload.area ? `${payload.area} m²` : targetFarm.blocks[blockIndex].area,
          nodeSensor: payload.nodeSensor ?? targetFarm.blocks[blockIndex].nodeSensor,
          status: payload.status ?? targetFarm.blocks[blockIndex].status,
          imageUrl: payload.imageUrl ?? targetFarm.blocks[blockIndex].imageUrl,
          harvestEstimate: payload.harvestEstimate ?? targetFarm.blocks[blockIndex].harvestEstimate,
        }
      }
    }
    return { success: true }
  },

  getSensorLogs: async (
    _blockId: string,
    _filterRange?: string
  ): Promise<SensorLogItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return MOCK_BLOCK_DETAIL.sensorLogs
  },

  getBlocksByFarmId: async (farmId: string): Promise<BlockItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 120))
    const farm = MOCK_FARMS.find((f) => f.id === farmId)
    return farm ? farm.blocks : []
  },
}
