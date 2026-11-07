export interface ActiveScheduleItem {
  id: string
  nodeCode: string
  location: string
  startTime: string
  endTime: string
  intensity: number
  mode?: 'manual' | 'auto'
  isOverride?: boolean
  targetLux?: number | null
  intensitasMinimum?: number | null
  baselineManualPersen?: number | null
  statusAktif?: boolean
}

export interface DimmingLogItem {
  id: string
  nodeCode: string
  time: string
  dimmingPercentage: number
  luxValue: number
  moonPhase: 'Full Moon' | 'Dawn' | 'Sunrise' | 'Clear Night'
}

export interface DimmingBarItem {
  hour: string
  percentage: number
}

export const MOCK_ACTIVE_SCHEDULES: ActiveScheduleItem[] = []

export const MOCK_DIMMING_CHARTS_BY_NODE: Record<string, DimmingBarItem[]> = {
  ALL: [],
}

export const MOCK_DIMMING_CHART: DimmingBarItem[] = []

export const MOCK_DIMMING_LOGS: DimmingLogItem[] = []

export const getActiveSchedules = (): ActiveScheduleItem[] => MOCK_ACTIVE_SCHEDULES
export const getDimmingChartData = (): DimmingBarItem[] => MOCK_DIMMING_CHART
export const getDimmingChartByNode = (nodeCode: string): DimmingBarItem[] => {
  return MOCK_DIMMING_CHARTS_BY_NODE[nodeCode] || []
}
export const getDimmingLogs = (): DimmingLogItem[] => MOCK_DIMMING_LOGS
