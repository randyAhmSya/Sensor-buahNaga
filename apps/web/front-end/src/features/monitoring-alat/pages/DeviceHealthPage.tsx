import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Activity, RefreshCw, ShieldAlert, Wifi, Cpu, Info } from 'lucide-react'
import { useSensorsQuery } from '@/hooks/queries/useSensorsQuery'
import { useFarmsQuery } from '@/hooks/queries/useFarmsQuery'

export function DeviceHealthPage() {
  const { data: farms = [] } = useFarmsQuery()
  const activeFarmId = farms.length > 0 ? farms[0].id : undefined
  const { data: sensors = [], isLoading, refetch } = useSensorsQuery(activeFarmId)

  const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const totalNodes = sensors.length
  const onlineCount = sensors.filter(
    (s) => s.status === 'Aktif' || s.status === 'Online'
  ).length
  const offlineCount = totalNodes - onlineCount

  const filteredSensors = sensors.filter((s) => {
    if (filter === 'ALL') return true
    const isOnline = s.status === 'Aktif' || s.status === 'Online'
    if (filter === 'ONLINE') return isOnline
    if (filter === 'OFFLINE') return !isOnline
    return true
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
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
            Status koneksi dan telemetri perangkat node sensor kebun buah naga
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing || isLoading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Segarkan Data
          </Button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Node Alat</span>
            <Cpu className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalNodes} <span className="text-sm font-normal text-slate-500">Unit</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Online & Aktif</span>
            <Wifi className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {onlineCount} <span className="text-sm font-normal text-emerald-700">Node</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Offline / Nonaktif</span>
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {offlineCount} <span className="text-sm font-normal text-slate-500">Node</span>
          </div>
        </div>
      </div>

      {/* Kartu Informasi Endpoint Diagnostik */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-900">Status Modul Diagnostik</h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            Fitur telemetri diagnostik mendalam sedang dalam pengembangan (memerlukan endpoint gateway health dari backend).
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ALL', 'ONLINE', 'OFFLINE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {status === 'ALL' ? 'Semua Node' : status === 'ONLINE' ? 'Online' : 'Offline'}
          </button>
        ))}
      </div>

      {/* Devices Grid */}
      {filteredSensors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">Belum ada perangkat sensor yang terdaftar.</p>
          <p className="text-xs text-slate-500">Tambahkan node sensor baru melalui menu Manajemen Sensor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSensors.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{s.nodeCode}</h3>
                    <p className="text-[11px] text-slate-500">{s.blockName}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    s.status === 'Aktif' || s.status === 'Online'
                      ? 'bg-white border-emerald-600 text-emerald-800'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  {s.status === 'Aktif' || s.status === 'Online' ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Terakhir terlihat:</span>
                <span className="font-semibold text-slate-700">{s.lastSeen}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Anomaly Log Section */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Log Deteksi Anomali Jaringan
          </h2>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
          Belum ada log anomali jaringan yang dilaporkan oleh gateway.
        </div>
      </div>
    </div>
  )
}
