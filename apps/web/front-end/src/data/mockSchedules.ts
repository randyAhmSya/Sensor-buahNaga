export interface ActiveScheduleItem {
  id: string
  nodeCode: string
  location: string
  startTime: string
  endTime: string
  intensity: number // Dalam persentase (contoh: 85)
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

export const MOCK_ACTIVE_SCHEDULES: ActiveScheduleItem[] = [
  {
    id: 'sch-1',
    nodeCode: 'ND-001',
    location: 'Kebun Raya Bogor - Blok A',
    startTime: '18:00',
    endTime: '05:00',
    intensity: 85,
  },
  {
    id: 'sch-2',
    nodeCode: 'ND-002',
    location: 'Kebun Raya Bogor - Blok B',
    startTime: '18:30',
    endTime: '04:30',
    intensity: 70,
  },
  {
    id: 'sch-3',
    nodeCode: 'ND-003',
    location: 'Lembang Farm - Blok Daun',
    startTime: '19:00',
    endTime: '06:00',
    intensity: 100,
  },
]

// Data chart per node spesifik (12-13 titik jam)
export const MOCK_DIMMING_CHARTS_BY_NODE: Record<string, DimmingBarItem[]> = {
  ALL: [
    { hour: '18:00', percentage: 40 },
    { hour: '19:00', percentage: 70 },
    { hour: '20:00', percentage: 85 },
    { hour: '21:00', percentage: 95 },
    { hour: '22:00', percentage: 100 },
    { hour: '23:00', percentage: 100 },
    { hour: '00:00', percentage: 100 },
    { hour: '01:00', percentage: 95 },
    { hour: '02:00', percentage: 85 },
    { hour: '03:00', percentage: 90 },
    { hour: '04:00', percentage: 100 },
    { hour: '05:00', percentage: 75 },
    { hour: '06:00', percentage: 50 },
  ],
  'ND-001': [
    { hour: '18:00', percentage: 45 },
    { hour: '19:00', percentage: 75 },
    { hour: '20:00', percentage: 85 },
    { hour: '21:00', percentage: 90 },
    { hour: '22:00', percentage: 95 },
    { hour: '23:00', percentage: 100 },
    { hour: '00:00', percentage: 100 },
    { hour: '01:00', percentage: 90 },
    { hour: '02:00', percentage: 85 },
    { hour: '03:00', percentage: 85 },
    { hour: '04:00', percentage: 90 },
    { hour: '05:00', percentage: 70 },
    { hour: '06:00', percentage: 40 },
  ],
  'ND-002': [
    { hour: '18:00', percentage: 30 },
    { hour: '19:00', percentage: 60 },
    { hour: '20:00', percentage: 75 },
    { hour: '21:00', percentage: 85 },
    { hour: '22:00', percentage: 90 },
    { hour: '23:00', percentage: 90 },
    { hour: '00:00', percentage: 90 },
    { hour: '01:00', percentage: 85 },
    { hour: '02:00', percentage: 80 },
    { hour: '03:00', percentage: 80 },
    { hour: '04:00', percentage: 85 },
    { hour: '05:00', percentage: 65 },
    { hour: '06:00', percentage: 45 },
  ],
  'ND-003': [
    { hour: '18:00', percentage: 50 },
    { hour: '19:00', percentage: 80 },
    { hour: '20:00', percentage: 95 },
    { hour: '21:00', percentage: 100 },
    { hour: '22:00', percentage: 100 },
    { hour: '23:00', percentage: 100 },
    { hour: '00:00', percentage: 100 },
    { hour: '01:00', percentage: 100 },
    { hour: '02:00', percentage: 95 },
    { hour: '03:00', percentage: 95 },
    { hour: '04:00', percentage: 100 },
    { hour: '05:00', percentage: 80 },
    { hour: '06:00', percentage: 60 },
  ],
}

export const MOCK_DIMMING_CHART: DimmingBarItem[] = MOCK_DIMMING_CHARTS_BY_NODE.ALL

// Data log tabel dengan relasi node
export const MOCK_DIMMING_LOGS: DimmingLogItem[] = [
  { id: 'log-1', nodeCode: 'ND-001', time: 'Okt 24, 02:00', dimmingPercentage: 85, luxValue: 1240, moonPhase: 'Full Moon' },
  { id: 'log-2', nodeCode: 'ND-001', time: 'Okt 24, 03:00', dimmingPercentage: 85, luxValue: 1180, moonPhase: 'Full Moon' },
  { id: 'log-3', nodeCode: 'ND-002', time: 'Okt 24, 02:00', dimmingPercentage: 80, luxValue: 1310, moonPhase: 'Full Moon' },
  { id: 'log-4', nodeCode: 'ND-002', time: 'Okt 24, 03:00', dimmingPercentage: 80, luxValue: 1250, moonPhase: 'Full Moon' },
  { id: 'log-5', nodeCode: 'ND-003', time: 'Okt 24, 02:00', dimmingPercentage: 95, luxValue: 980, moonPhase: 'Full Moon' },
  { id: 'log-6', nodeCode: 'ND-003', time: 'Okt 24, 03:00', dimmingPercentage: 95, luxValue: 920, moonPhase: 'Full Moon' },
  { id: 'log-7', nodeCode: 'ND-001', time: 'Okt 24, 04:00', dimmingPercentage: 90, luxValue: 1050, moonPhase: 'Full Moon' },
  { id: 'log-8', nodeCode: 'ND-002', time: 'Okt 24, 05:00', dimmingPercentage: 65, luxValue: 1520, moonPhase: 'Dawn' },
  { id: 'log-9', nodeCode: 'ND-003', time: 'Okt 24, 06:00', dimmingPercentage: 60, luxValue: 1850, moonPhase: 'Sunrise' },
]

export const getActiveSchedules = (): ActiveScheduleItem[] => MOCK_ACTIVE_SCHEDULES
export const getDimmingChartData = (): DimmingBarItem[] => MOCK_DIMMING_CHART
export const getDimmingChartByNode = (nodeCode: string): DimmingBarItem[] => {
  return MOCK_DIMMING_CHARTS_BY_NODE[nodeCode] || MOCK_DIMMING_CHARTS_BY_NODE.ALL
}
export const getDimmingLogs = (): DimmingLogItem[] => MOCK_DIMMING_LOGS
