import React from 'react'
import { History } from 'lucide-react'
import type { CycleHistoryItem } from '@/types/block.types'
import { formatIndoDate } from '@/utils/formatters'

interface CycleHistoryTableProps {
  history: CycleHistoryItem[]
}

export const CycleHistoryTable: React.FC<CycleHistoryTableProps> = ({ history }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <History className="w-4 h-4 text-emerald-700" />
        <h3 className="text-base font-bold text-slate-900">Riwayat Siklus Panen Sebelumnya</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[550px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">ID Siklus</th>
              <th className="py-3 px-4">Tanggal Mulai</th>
              <th className="py-3 px-4">Panen Aktual</th>
              <th className="py-3 px-4">Durasi Penyinaran</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-medium">
                  Belum ada riwayat siklus panen sebelumnya untuk blok ini.
                </td>
              </tr>
            ) : (
              history.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{row.id}</td>
                  <td className="py-3.5 px-4 text-slate-600">{formatIndoDate(row.startDate)}</td>
                  <td className="py-3.5 px-4 text-slate-600">{formatIndoDate(row.actualHarvestDate)}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{row.durationDays} Hari</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        row.status === 'Selesai'
                          ? 'border-emerald-600 bg-white text-emerald-700'
                          : 'border-amber-500 bg-white text-amber-700'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
