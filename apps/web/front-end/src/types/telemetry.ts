import type { LucideIcon } from 'lucide-react'

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
  status: 'Optimal' | 'Low Light' | 'Offline' | 'Online' | 'Belum pernah terhubung'
}

export interface DashboardMetricItem {
  title: string
  value: number | string
  unit: string
  unitColor?: string
  icon: LucideIcon
  iconColor: string
  badgeText?: string
  badgeVariant?: 'emerald' | 'amber' | 'rose' | 'slate'
}

// Backward compatibility alias
export type TelemetryActivityItem = TelemetryNodeRow
export type DashboardCardMetricItem = DashboardMetricItem
