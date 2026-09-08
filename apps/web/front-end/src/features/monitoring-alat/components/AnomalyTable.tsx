import { AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react'
import type { NodeSensorHealthDTO } from '../../../types/database.types'
import { Badge } from '../../../components/ui/Badge'
import { formatDateTime } from '../../../utils/formatters'

interface AnomalyTableProps {
  devices: NodeSensorHealthDTO[]
}

export function AnomalyTable({ devices }: AnomalyTableProps) {
  // Flatten anomalies from devices
  const allAnomalies = devices.flatMap((d) =>
    (d.anomali || []).map((a) => ({
      ...a,
      nama_perangkat: d.nama_perangkat,
      kode_perangkat: d.kode_perangkat,
      lokasi_kebun: d.lokasi_kebun,
    }))
  )

  if (allAnomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200">
        <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
        <p className="text-sm font-semibold text-slate-800">Semua Perangkat Normal</p>
        <p className="text-xs text-slate-500 mt-1">
          Tidak ada anomali atau fluktuasi sensor terdeteksi saat ini.
        </p>
      </div>
    )
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <Badge variant="danger" dot>
            Kritis
          </Badge>
        )
      case 'WARNING':
        return (
          <Badge variant="warning" dot>
            Peringatan
          </Badge>
        )
      default:
        return <Badge variant="neutral">Info</Badge>
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
          <tr>
            <th className="px-5 py-3.5">Waktu Terdeteksi</th>
            <th className="px-5 py-3.5">Perangkat & Lokasi</th>
            <th className="px-5 py-3.5">Tingkat Keparahan</th>
            <th className="px-5 py-3.5">Deskripsi Masalah Anomali</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {allAnomalies.map((item) => (
            <tr key={item.id_anomali} className="hover:bg-slate-50/80 transition-colors">
              <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-500">
                {formatDateTime(item.waktu)}
              </td>
              <td className="px-5 py-3.5">
                <div className="font-semibold text-slate-900">{item.nama_perangkat}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {item.kode_perangkat} &bull; {item.lokasi_kebun}
                </div>
              </td>
              <td className="px-5 py-3.5 whitespace-nowrap">
                {getSeverityBadge(item.tingkat_keparahan)}
              </td>
              <td className="px-5 py-3.5 text-xs text-slate-600 max-w-md">
                <div className="flex items-start gap-1.5">
                  {item.tingkat_keparahan === 'CRITICAL' ? (
                    <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <span>{item.deskripsi}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
