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
  kodePairing?: string | null
  pairingCode?: string | null
  tokenGateway?: string | null
  tipeSensor?: string
  status: SensorStatus
  luxLevel: number | null
  temperature: number | null
  lastSeen: string
  sparklineData: number[]
  qrCode?: string
  jumlah_lampu?: number
  watt_per_lampu?: number | null
  watt_terpasang?: number | null
}

export interface SensorSummaryMetrics {
  totalNodes: number
  onlineNodes: number
  offlineNodes: number
}
