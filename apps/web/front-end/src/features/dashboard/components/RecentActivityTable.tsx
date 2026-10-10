import { memo } from 'react'
import type { TelemetryNodeRow } from '@/types/telemetry'
import { getTelemetryNodes } from '@/data/mockTelemetry'
import { StatusBadge } from '@/components/ui/StatusBadge'

export type ActivityItem = TelemetryNodeRow

interface RecentActivityTableRowProps {
  item: TelemetryNodeRow
}

const RecentActivityTableRow = memo<RecentActivityTableRowProps>(({ item }) => {
  const getVariant = () => {
    if (item.status === 'Optimal') return 'optimal'
    if (item.status === 'Low Light') return 'warning'
    return 'danger'
  }

  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="py-4 px-6 font-semibold text-slate-900">{item.nodeCode}</td>
      <td className="py-4 px-6 text-slate-600">{item.location}</td>
      <td className="py-4 px-6">
        <span className="font-medium text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-xs shadow-2xs">
          {item.luxValue}
        </span>
      </td>
      <td className="py-4 px-6 text-slate-600">{item.powerConsumption}</td>
      <td className="py-4 px-6 text-slate-400 text-xs">{item.recordedTime}</td>
      <td className="py-4 px-6 text-center w-32">
        <div className="flex justify-center">
          <StatusBadge status={item.status} variant={getVariant()} />
        </div>
      </td>
    </tr>
  )
})

RecentActivityTableRow.displayName = 'RecentActivityTableRow'

interface RecentActivityTableProps {
  activities?: TelemetryNodeRow[]
  onViewAll?: () => void
}

export const RecentActivityTable = memo<RecentActivityTableProps>(({
  activities = getTelemetryNodes(),
  onViewAll,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden h-full flex flex-col justify-between">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Telemetri Node Terkini</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemantauan intensitas cahaya dan daya aktual per blok lampu.
          </p>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer active:scale-[0.98] transition-transform"
          >
            Lihat Semua Node
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6">Kode Node</th>
              <th className="py-3.5 px-6">Lokasi</th>
              <th className="py-3.5 px-6">Nilai Lux</th>
              <th className="py-3.5 px-6">Konsumsi Daya</th>
              <th className="py-3.5 px-6">Waktu Tercatat</th>
              <th className="py-3.5 px-6 text-center w-32">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                  Belum ada aktivitas sensor tercatat
                </td>
              </tr>
            ) : (
              activities.map((item) => (
                <RecentActivityTableRow key={item.nodeCode} item={item} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})

RecentActivityTable.displayName = 'RecentActivityTable'
