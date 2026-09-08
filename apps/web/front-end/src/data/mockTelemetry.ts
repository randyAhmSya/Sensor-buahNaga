import { Trees, Grid, Router, Repeat, type LucideIcon } from 'lucide-react'

export interface DashboardMetrics {
  totalFarms: number
  activeBlocks: number
  totalNodes: number
  offlineNodes: number
  runningHarvestCycles: number
  currentCycleText: string
  currentDateText: string
  harvestEstimateText: string
}

export interface TelemetryNodeRow {
  nodeCode: string
  location: string
  luxValue: string
  powerConsumption: string
  recordedTime: string
  status: 'Optimal' | 'Low Light' | 'Offline'
}

export interface DashboardCardMetricItem {
  title: string
  value: number | string
  unit: string
  unitColor?: string
  icon: LucideIcon
  iconColor: string
  badgeText?: string
  badgeVariant?: 'emerald' | 'amber' | 'rose' | 'slate'
}

export const MOCK_METRICS: DashboardMetrics = {
  totalFarms: 5,
  activeBlocks: 24,
  totalNodes: 112,
  offlineNodes: 3,
  runningHarvestCycles: 8,
  currentCycleText: 'Siklus Vegetatif Aktif',
  currentDateText: 'Senin, 24 Oktober 2023',
  harvestEstimateText: 'Estimasi Panen Blok A: 24 Nov 2023 (Toleransi ±3 Hari)',
}

export const MOCK_TELEMETRY_NODES: TelemetryNodeRow[] = [
  {
    nodeCode: 'ND-001',
    location: 'Utara - Blok A',
    luxValue: '12,500 Lux',
    powerConsumption: '45.2 W',
    recordedTime: '2 mnt lalu',
    status: 'Optimal',
  },
  {
    nodeCode: 'ND-042',
    location: 'Selatan - Blok C',
    luxValue: '8,200 Lux',
    powerConsumption: '40.5 W',
    recordedTime: '5 mnt lalu',
    status: 'Optimal',
  },
  {
    nodeCode: 'ND-108',
    location: 'Timur - Blok B',
    luxValue: '1,200 Lux',
    powerConsumption: '12.0 W',
    recordedTime: '15 mnt lalu',
    status: 'Low Light',
  },
  {
    nodeCode: 'ND-077',
    location: 'Barat - Blok D',
    luxValue: '11,800 Lux',
    powerConsumption: '44.8 W',
    recordedTime: '22 mnt lalu',
    status: 'Optimal',
  },
]

export const getDashboardMetrics = (): DashboardMetrics => ({ ...MOCK_METRICS })

export const getTelemetryNodes = (): TelemetryNodeRow[] => [...MOCK_TELEMETRY_NODES]

// Helper to convert metrics into 4 bento cards
export const getDashboardMetricCards = (metrics: DashboardMetrics = MOCK_METRICS): DashboardCardMetricItem[] => [
  {
    title: 'Total Lahan Kebun',
    value: metrics.totalFarms,
    unit: 'Lokasi',
    icon: Trees,
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Jumlah Blok Aktif',
    value: metrics.activeBlocks,
    unit: 'Blok',
    icon: Grid,
    iconColor: 'text-blue-600',
  },
  {
    title: 'Node Lampu IoT',
    value: metrics.totalNodes,
    unit: 'Online',
    unitColor: 'text-emerald-600',
    icon: Router,
    iconColor: 'text-amber-600',
    badgeText: `${metrics.offlineNodes} Offline`,
    badgeVariant: 'rose',
  },
  {
    title: 'Siklus Panen Berjalan',
    value: metrics.runningHarvestCycles,
    unit: 'Batch',
    icon: Repeat,
    iconColor: 'text-purple-600',
  },
]

// Backward compatibility helpers
export const getRecentActivities = getTelemetryNodes
export const getOfflineNodeCount = (): number => MOCK_METRICS.offlineNodes
