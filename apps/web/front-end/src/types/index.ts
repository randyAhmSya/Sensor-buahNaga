import type { UserRole } from '../config/constants'

// Export all database schema interfaces
export * from './database.types'
export * from './user'
export * from './telemetry'
export * from './farm'
export * from './sensor.types'

// User & Auth Types
export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  tenantId: string
  avatarUrl?: string
}

export interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  login: (user: UserProfile, token: string) => void
  logout: () => void
}

// Re-export or alias for UI backwards-compatibility / convenience
export type {
  NodeSensorHealthDTO as DeviceHealth,
  SensorAnomaly as DeviceAnomaly,
  BlokHarvestDTO as HarvestBlock,
  KodeQrDTO as QrSticker,
  TenantHierarchyDTO as TenantData,
} from './database.types'

// Supporting UI Specific Types
export interface DeviceMetrics {
  temperature: number
  voltage: number
  solarInputVoltage?: number
  rssi?: number
  batteryLevel?: number
}
