export type MoonPhase = 'Full Moon' | 'Dawn' | 'Sunrise' | 'Clear Night'

export interface ActiveScheduleItem {
  id: string
  nodeCode: string
  location: string
  startTime: string
  endTime: string
  intensity: number // Dalam persentase (contoh: 85)
  mode?: 'manual' | 'auto'
  isOverride?: boolean
  targetLux?: number | null
  intensitasMinimum?: number | null
  baselineManualPersen?: number | null
  statusAktif?: boolean
}

export interface DimmingLogItem {
  id: string
  time: string
  dimmingPercentage: number
  luxValue: number
  moonPhase: MoonPhase
}

export interface DimmingBarItem {
  hour: string
  percentage: number
}
