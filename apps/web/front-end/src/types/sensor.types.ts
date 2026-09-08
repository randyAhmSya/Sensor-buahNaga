export type SensorStatus = 'Online' | 'Offline'

export interface SensorNodeItem {
  id: string
  nodeCode: string
  farmId: string
  farmName: string
  blockId: string
  blockName: string
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
