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
  deviceStatus: 'Online' | 'Offline'
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

export const MOCK_BLOCK_DETAIL: BlockDetailFull = {
  id: '',
  farmId: '',
  farmName: '',
  name: '',
  area: '0 m²',
  bannerUrl: '',
  deviceId: '-',
  deviceStatus: 'Offline',
  currentLux: '0',
  temperature: '0°C',
  gateway: '-',
  lastSeen: '-',
  lightingSchedule: {
    activeCycle: '-',
    intensity: '0%',
  },
  energyConsumption: {
    kwh: 0,
    period: '-',
  },
  harvestCycle: {
    status: 'Tidak Aktif',
    lightingStart: '-',
    floweringTarget: '-',
    harvestEstimate: '-',
  },
  cycleHistory: [],
  sensorLogs: [],
}

export const getBlockDetailById = (blockId: string, farmId?: string): BlockDetailFull => {
  return {
    ...MOCK_BLOCK_DETAIL,
    id: blockId || '',
    farmId: farmId || '',
  }
}
