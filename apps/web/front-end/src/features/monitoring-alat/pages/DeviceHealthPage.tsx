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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Node Alat</p>
            <p className="text-xl font-bold text-slate-900">{devices.length} Unit</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-emerald-100 text-emerald-700">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Online & Optimal</p>
            <p className="text-xl font-bold text-emerald-700">{onlineCount} Node</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Degradasi Sinyal</p>
            <p className="text-xl font-bold text-amber-700">{degradedCount} Node</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Offline / Butuh Servis</p>
            <p className="text-xl font-bold text-rose-700">{offlineCount} Node</p>
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
