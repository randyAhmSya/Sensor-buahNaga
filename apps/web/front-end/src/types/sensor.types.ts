export type SensorStatus = 'Aktif' | 'Nonaktif' | 'Online' | 'Offline' | string

export interface SensorNodeItem {
  id: string
  nodeCode: string
  farmId: string
  farmName: string
  blockId: string
  blockName: string
  gatewayId?: string | null
  gatewayCode?: string | null
  gatewayStatus?: string | null
  tipeSensor?: string
  status: SensorStatus
  luxLevel: number
  temperature: number
  lastSeen: string
  sparklineData: number[]
}

export interface SensorSummaryMetrics {
  totalNodes: number
  onlineNodes: number
  offlineNodes: number
}
