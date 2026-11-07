import { useState } from 'react'
import mockHealthData from '../../../services/mock/mockHealth.json'
import type { NodeSensorHealthDTO } from '../../../types/database.types'
import { TelemetryCard } from '../components/TelemetryCard'
import { AnomalyTable } from '../components/AnomalyTable'
import { Button } from '../../../components/ui/Button'
import { Activity, RefreshCw, ShieldAlert, Wifi, Cpu } from 'lucide-react'

export function DeviceHealthPage() {
  const devices = mockHealthData as unknown as NodeSensorHealthDTO[]
  const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'DEGRADED' | 'OFFLINE'>('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredDevices = devices.filter((d) => {
    if (filter === 'ALL') return true
    return d.status_koneksi === filter
  })

  const onlineCount = devices.filter((d) => d.status_koneksi === 'ONLINE').length
  const degradedCount = devices.filter((d) => d.status_koneksi === 'DEGRADED').length
  const offlineCount = devices.filter((d) => d.status_koneksi === 'OFFLINE').length

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-emerald-600" />
            Monitoring Kesehatan Sensor & Gateway
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Status telemetri real-time jaringan LoRaWAN dan sensor pencahayaan kebun buah naga
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Segarkan Data
          </Button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Node Alat</span>
            <Cpu className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {devices.length} <span className="text-sm font-normal text-slate-500">Unit</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Online & Optimal</span>
            <Wifi className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {onlineCount} <span className="text-sm font-normal text-emerald-700">Node</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Degradasi Sinyal</span>
            <Activity className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {degradedCount} <span className="text-sm font-normal text-slate-500">Node</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Offline / Butuh Servis</span>
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {offlineCount} <span className="text-sm font-normal text-slate-500">Node</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'ONLINE', 'DEGRADED', 'OFFLINE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {status === 'ALL' ? 'Semua Node' : status}
          </button>
        ))}
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => (
          <TelemetryCard key={device.id_sensor} device={device} />
        ))}
      </div>

      {/* Anomaly Log Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Log Deteksi Anomali & Rekomendasi Lapangan
          </h2>
          <span className="text-xs text-slate-500">Auto-refresh setiap 5 menit</span>
        </div>
        <AnomalyTable devices={devices} />
      </div>
    </div>
  )
}
