export type BlockStatus = 'Online' | 'Offline'

export interface BlockItem {
  id: string
  name: string
  phase?: string
  description: string
  area: string
  nodeSensor: string
  status: BlockStatus
  harvestEstimate?: string
  imageUrl: string
}

export interface SensorLogItem {
  id: string
  timestamp: string
  lux: string
  temperature: string
  humidity: string
  battery: string
  signalQuality: string
  gatewayStatus: 'Online / Synced' | 'Offline'
}

export interface CycleHistoryItem {
  id: string
  startDate: string
  actualHarvestDate: string
  durationDays: number
  status: 'Selesai' | 'Berjalan'
}

export interface BlockDetailFull {
  id: string
  farmId: string
  farmName: string
  name: string
  area: string
  bannerUrl: string
  deviceId: string
  deviceStatus: BlockStatus
  currentLux: string
  temperature: string
  gateway: string
  lastSeen: string
  lightingSchedule: {
    activeCycle: string
    intensity: string
  }
  energyConsumption: {
    kwh: number
    period: string
  }
  harvestCycle: {
    status: string
    lightingStart: string
    floweringTarget: string
    harvestEstimate: string
  }
  cycleHistory: CycleHistoryItem[]
  sensorLogs: SensorLogItem[]
}
