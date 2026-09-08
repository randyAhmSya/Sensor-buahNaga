import { Cpu, Zap, Thermometer, Wifi, Clock, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { HealthBadge } from './HealthBadge'
import type { NodeSensorHealthDTO } from '../../../types/database.types'
import { formatTemperature, formatVoltage, formatDateTime } from '../../../utils/formatters'

interface TelemetryCardProps {
  device: NodeSensorHealthDTO
}

export function TelemetryCard({ device }: TelemetryCardProps) {
  return (
    <Card className="hover:border-slate-300 hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{device.nama_perangkat}</CardTitle>
            <p className="text-xs text-slate-500 font-mono">
              {device.kode_perangkat} &bull; {device.tipe_sensor}
            </p>
          </div>
        </div>
        <HealthBadge status={device.status_koneksi} />
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
            <Thermometer className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500">Suhu Node</p>
              <p className="font-semibold text-slate-800">
                {formatTemperature(device.suhu)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
            <Zap className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500">Tegangan Daya</p>
              <p className="font-semibold text-slate-800">
                {formatVoltage(device.tegangan_volt)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3.5 space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Activity className="h-3.5 w-3.5 text-emerald-600" /> Konsumsi Daya
            </span>
            <span className="font-medium text-slate-700">{device.konsumsi_watt} Watt</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Uptime
            </span>
            <span className="font-medium text-slate-700">{device.uptime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Wifi className="h-3.5 w-3.5" /> Ping Terakhir
            </span>
            <span className="font-medium text-slate-700">
              {formatDateTime(device.last_ping)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
