export interface SensorNodeItem {
  id: string
  nodeCode: string
  farmId: string
  farmName: string
  blockId: string
  blockName: string
  status: 'Online' | 'Offline'
  luxLevel: number
  temperature: number
  lastSeen: string
  sparklineData: number[] // Array nilai tren lux untuk grafik garis mini
}

export interface SensorSummaryMetrics {
  totalNodes: number
  onlineNodes: number
  offlineNodes: number
}

export const MOCK_SENSOR_SUMMARY: SensorSummaryMetrics = {
  totalNodes: 112,
  onlineNodes: 109,
  offlineNodes: 3,
}

export const MOCK_SENSOR_NODES: SensorNodeItem[] = [
  {
    id: 'snsr-01',
    nodeCode: 'ND-001',
    farmId: 'farm-1',
    farmName: 'Kebun Raya Bogor',
    blockId: 'blk-1',
    blockName: 'Blok A',
    status: 'Online',
    luxLevel: 12500,
    temperature: 28.5,
    lastSeen: '2 mnt lalu',
    sparklineData: [15, 10, 18, 5, 12, 2],
  },
  {
    id: 'snsr-02',
    nodeCode: 'ND-002',
    farmId: 'farm-1',
    farmName: 'Kebun Raya Bogor',
    blockId: 'blk-1',
    blockName: 'Blok A',
    status: 'Online',
    luxLevel: 11200,
    temperature: 29.1,
    lastSeen: '5 mnt lalu',
    sparklineData: [18, 15, 10, 12, 8, 5],
  },
  {
    id: 'snsr-03',
    nodeCode: 'ND-003',
    farmId: 'farm-1',
    farmName: 'Kebun Raya Bogor',
    blockId: 'blk-2',
    blockName: 'Blok B',
    status: 'Offline',
    luxLevel: 0,
    temperature: 0,
    lastSeen: '2 jam lalu',
    sparklineData: [],
  },
  {
    id: 'snsr-04',
    nodeCode: 'ND-004',
    farmId: 'farm-1',
    farmName: 'Kebun Raya Bogor',
    blockId: 'blk-2',
    blockName: 'Blok B',
    status: 'Online',
    luxLevel: 13100,
    temperature: 27.8,
    lastSeen: '1 mnt lalu',
    sparklineData: [5, 8, 4, 10, 15, 12],
  },
  {
    id: 'snsr-05',
    nodeCode: 'ND-005',
    farmId: 'farm-2',
    farmName: 'Lembang Farm House',
    blockId: 'blk-201',
    blockName: 'Blok Sayur Daun',
    status: 'Online',
    luxLevel: 10800,
    temperature: 24.2,
    lastSeen: '4 mnt lalu',
    sparklineData: [12, 14, 9, 11, 7, 4],
  },
  {
    id: 'snsr-06',
    nodeCode: 'ND-006',
    farmId: 'farm-3',
    farmName: 'Indoor Farm BSD',
    blockId: 'blk-301',
    blockName: 'Blok Vertikal Lab',
    status: 'Offline',
    luxLevel: 0,
    temperature: 0,
    lastSeen: '1 hari lalu',
    sparklineData: [],
  },
]

export const getSensorSummary = (): SensorSummaryMetrics => MOCK_SENSOR_SUMMARY
export const getAllSensors = (): SensorNodeItem[] => MOCK_SENSOR_NODES
