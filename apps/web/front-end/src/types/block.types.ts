export type BlockStatus = 'Online' | 'Offline'

export interface BlokBackend {
  id_blok: string
  id?: string
  kebun_id?: string
  id_kebun?: string
  nama_blok: string
  keterangan: string | null
  luas_area: number | string | null
  url_foto: string | null
  estimasi_panen?: string | null
  harvest_date?: string | null
  created_at?: string
  updated_at?: string
  kebun?: {
    id_kebun?: string
    id?: string
    nama_kebun?: string
  }
  node_sensor?: {
    id_sensor: string
    id?: string
    kode_perangkat: string
    status_koneksi: string
  }
}

export interface CreateBlokPayload {
  kebun_id: string
  nama_blok: string
  keterangan?: string
  luas_area?: number
  foto?: File
}

export interface UpdateBlokPayload {
  nama_blok?: string
  keterangan?: string
  luas_area?: number
  url_foto?: string
  foto?: File
}

export interface BlockItem {
  id: string
  id_blok?: string
  name: string
  phase?: string
  description: string
  area: string
  nodeSensor: string
  status: BlockStatus
  harvestEstimate?: string
  imageUrl: string
}

export interface SensorLogItem {
  id: string
  timestamp: string
  lux: string
  temperature: string
  humidity: string
  battery: string
  signalQuality: string
  gatewayStatus: 'Online / Synced' | 'Offline'
}

export interface CycleHistoryItem {
  id: string
  startDate: string
  actualHarvestDate: string
  durationDays: number
  status: 'Selesai' | 'Berjalan'
}

export interface BlockDetailFull {
  id: string
  farmId: string
  farmName: string
  name: string
  description?: string
  area: string
  bannerUrl: string
  deviceId: string
  nodeSensorId?: string
  deviceStatus: BlockStatus
  currentLux: string
  temperature: string
  gateway: string
  lastSeen: string
  lightingSchedule: {
    activeCycle: string
    intensity: string
  }
  energyConsumption: {
    kwh: number
    period: string
  }
  harvestCycle: {
    status: string
    lightingStart: string
    floweringTarget: string
    harvestEstimate: string
  }
  cycleHistory: CycleHistoryItem[]
  sensorLogs: SensorLogItem[]
}

export interface BlokStatusLampuNode {
  id_sensor: string
  kode_perangkat: string
  status_online: boolean
  terakhir_terlihat: string | null
}

export interface BlokStatusLampuResponse {
  jumlah_lampu: number
  jumlah_online: number
  jumlah_offline: number
  batas_offline_detik: number
  nodes: BlokStatusLampuNode[]
}
