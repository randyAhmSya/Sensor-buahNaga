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
  totalFarms: 0,
  activeBlocks: 0,
  totalNodes: 0,
  offlineNodes: 0,
  runningHarvestCycles: 0,
  currentCycleText: 'Belum Ada Siklus Aktif',
  currentDateText: '-',
  harvestEstimateText: 'Belum ada estimasi panen',
}

export const MOCK_TELEMETRY_NODES: TelemetryNodeRow[] = []

export const getDashboardMetrics = (): DashboardMetrics => ({ ...MOCK_METRICS })

export const getTelemetryNodes = (): TelemetryNodeRow[] => [...MOCK_TELEMETRY_NODES]

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
    badgeVariant: 'slate',
  },
  {
    title: 'Siklus Panen Berjalan',
    value: metrics.runningHarvestCycles,
    unit: 'Batch',
    icon: Repeat,
    iconColor: 'text-purple-600',
  },
]

export const getRecentActivities = getTelemetryNodes
export const getOfflineNodeCount = (): number => MOCK_METRICS.offlineNodes
