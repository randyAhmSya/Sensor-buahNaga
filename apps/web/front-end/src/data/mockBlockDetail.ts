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
  id: 'blk-1',
  farmId: 'farm-1',
  farmName: 'Kebun Raya Bogor',
  name: 'Blok A - Vegetatif',
  area: '500 m²',
  bannerUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAYrpIW_P9Le_nSFn50QC_tohbXw7AQIiUP7wup0GT5285txyvWzWwPD6kqdSc7pFVtqjMM3WrETooHyTEoYdvZeNZWLO1OY_IicLcekq2bE03Z5QZxlNSdU7ziXwdC7U07NilFCfbU4CuJ5XdZZUF5jFrJLG46aGcyV766wt814OdaWskJKEnUUNqiDwBS9x8B3pf16Lu1qQAtCIN1XABpchcaYwzqvBcCgcp2bIjam3gp6vi7fA1mIQ',
  deviceId: 'AGL-SNSR-082',
  deviceStatus: 'Online',
  currentLux: '45,000',
  temperature: '28.5°C',
  gateway: 'GTW-MAIN-01',
  lastSeen: '2 mnt lalu',
  lightingSchedule: {
    activeCycle: '18:00 - 05:00',
    intensity: '85%',
  },
  energyConsumption: {
    kwh: 124.5,
    period: '7 Hari Terakhir',
  },
  harvestCycle: {
    status: 'Berjalan',
    lightingStart: '12 Sep 2023',
    floweringTarget: '05 Okt 2023',
    harvestEstimate: '15 Okt 2023',
  },
  cycleHistory: [
    {
      id: 'h-1',
      startDate: '10 Jun 2023',
      actualHarvestDate: '15 Jul 2023',
      durationDays: 35,
      status: 'Selesai',
    },
    {
      id: 'h-2',
      startDate: '01 Apr 2023',
      actualHarvestDate: '05 Mei 2023',
      durationDays: 34,
      status: 'Selesai',
    },
    {
      id: 'h-3',
      startDate: '15 Jan 2023',
      actualHarvestDate: '22 Feb 2023',
      durationDays: 38,
      status: 'Selesai',
    },
  ],
  sensorLogs: [
    {
      id: 'log-1',
      timestamp: '12 Okt 2023, 14:30:15',
      lux: '45,200 Lux',
      temperature: '28.4 °C',
      humidity: '68%',
      battery: '98% Normal',
      signalQuality: '-65 dBm',
      gatewayStatus: 'Online / Synced',
    },
    {
      id: 'log-2',
      timestamp: '12 Okt 2023, 14:25:15',
      lux: '45,150 Lux',
      temperature: '28.5 °C',
      humidity: '67%',
      battery: '98% Normal',
      signalQuality: '-66 dBm',
      gatewayStatus: 'Online / Synced',
    },
    {
      id: 'log-3',
      timestamp: '12 Okt 2023, 14:20:15',
      lux: '45,100 Lux',
      temperature: '28.6 °C',
      humidity: '69%',
      battery: '97% Normal',
      signalQuality: '-64 dBm',
      gatewayStatus: 'Online / Synced',
    },
    {
      id: 'log-4',
      timestamp: '12 Okt 2023, 14:15:15',
      lux: '44,980 Lux',
      temperature: '28.5 °C',
      humidity: '70%',
      battery: '97% Normal',
      signalQuality: '-67 dBm',
      gatewayStatus: 'Online / Synced',
    },
    {
      id: 'log-5',
      timestamp: '12 Okt 2023, 14:10:15',
      lux: '44,900 Lux',
      temperature: '28.3 °C',
      humidity: '71%',
      battery: '97% Normal',
      signalQuality: '-65 dBm',
      gatewayStatus: 'Online / Synced',
    },
  ],
}

export const getBlockDetailById = (blockId: string, farmId?: string): BlockDetailFull => {
  return {
    ...MOCK_BLOCK_DETAIL,
    id: blockId || MOCK_BLOCK_DETAIL.id,
    farmId: farmId || MOCK_BLOCK_DETAIL.farmId,
  }
}
