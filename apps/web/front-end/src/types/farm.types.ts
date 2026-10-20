import type { BlockItem } from './block.types'
export type { KebunBackend, CreateKebunPayload, UpdateKebunPayload } from './kebun.types'

export type FarmStatus = 'Aktif' | 'Inaktif'

export interface FarmItem {
  id: string
  id_kebun?: string
  name: string
  description?: string
  location: string
  status: FarmStatus
  totalBlocks: number
  imageUrl: string
  bannerUrl: string
  gpsCoordinates?: string
  additionalNotes?: string
  blocks: BlockItem[]
}

export type FarmDetail = FarmItem
export type Farm = FarmItem
