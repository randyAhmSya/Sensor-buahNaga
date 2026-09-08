import type { FarmItem } from '@/types/farm.types'
import { MOCK_FARMS } from '@/data/mockFarms'

export interface CreateFarmPayload {
  name: string
  location: string
  description?: string
  imageUrl: string
  bannerUrl?: string
  status: 'Aktif' | 'Inaktif'
  gpsCoordinates?: string
  additionalNotes?: string
}

let inMemoryFarms = [...MOCK_FARMS]

export const farmService = {
  getAll: async (): Promise<FarmItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return [...inMemoryFarms]
  },

  getById: async (id: string): Promise<FarmItem | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 120))
    return inMemoryFarms.find((f) => f.id === id)
  },

  create: async (payload: CreateFarmPayload): Promise<{ success: boolean; id: string; farm: FarmItem }> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const newFarm: FarmItem = {
      id: `farm-${Date.now()}`,
      name: payload.name,
      location: payload.location,
      description: payload.description,
      status: payload.status,
      totalBlocks: 0,
      imageUrl: payload.imageUrl,
      bannerUrl: payload.bannerUrl || payload.imageUrl,
      gpsCoordinates: payload.gpsCoordinates,
      additionalNotes: payload.additionalNotes,
      blocks: [],
    }
    inMemoryFarms = [newFarm, ...inMemoryFarms]
    return { success: true, id: newFarm.id, farm: newFarm }
  },

  update: async (id: string, payload: Partial<CreateFarmPayload>): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 180))
    inMemoryFarms = inMemoryFarms.map((farm) => {
      if (farm.id === id) {
        return {
          ...farm,
          ...payload,
          bannerUrl: payload.bannerUrl || payload.imageUrl || farm.bannerUrl,
        }
      }
      return farm
    })
    return { success: true }
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    inMemoryFarms = inMemoryFarms.filter((f) => f.id !== id)
    return { success: true }
  },
}
