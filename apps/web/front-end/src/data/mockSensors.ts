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
  sparklineData: number[]
}

export interface SensorSummaryMetrics {
  totalNodes: number
  onlineNodes: number
  offlineNodes: number
}

export const MOCK_SENSOR_SUMMARY: SensorSummaryMetrics = {
  totalNodes: 0,
  onlineNodes: 0,
  offlineNodes: 0,
}

export const MOCK_SENSOR_NODES: SensorNodeItem[] = []

export const getSensorSummary = (): SensorSummaryMetrics => MOCK_SENSOR_SUMMARY
export const getAllSensors = (): SensorNodeItem[] => MOCK_SENSOR_NODES
