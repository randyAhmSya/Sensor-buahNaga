import React from 'react'
import { Lightbulb, Pencil, Trash2 } from 'lucide-react'
import type { ActiveScheduleItem } from '@/data/mockSchedules'

interface ActiveSchedulesTableProps {
  schedules: ActiveScheduleItem[]
  onEdit?: (schedule: ActiveScheduleItem) => void
  onDelete?: (id: string) => void
}

export const ActiveSchedulesTable: React.FC<ActiveSchedulesTableProps> = ({
  schedules,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl border border-emerald-200 bg-white text-emerald-700 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">Jadwal Pencahayaan Aktif</h3>
            <p className="text-xs text-slate-500">Konfigurasi waktu operasional dan intensitas lampu node</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Kode Node</th>
              <th className="py-3.5 px-5">Lokasi Kebun & Blok</th>
              <th className="py-3.5 px-5">Mulai Nyala</th>
              <th className="py-3.5 px-5">Akhir Nyala</th>
              <th className="py-3.5 px-5 text-right">Intensitas</th>
              <th className="py-3.5 px-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {schedules.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-5 font-bold text-slate-900">{item.nodeCode}</td>
                <td className="py-4 px-5 text-slate-600 font-medium">{item.location}</td>
                <td className="py-4 px-5 text-slate-800 font-semibold">{item.startTime}</td>
                <td className="py-4 px-5 text-slate-800 font-semibold">{item.endTime}</td>
                <td className="py-4 px-5 text-right">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-600 bg-white text-emerald-700">
                    {item.intensity}%
                  </span>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit?.(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Jadwal"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
