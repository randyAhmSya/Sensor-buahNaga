import React, { useState } from 'react'
import { FileSpreadsheet, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { SensorLogItem } from '@/types/block.types'

interface SensorLogTableProps {
  logs: SensorLogItem[]
  onRangeFilterChange?: (range: string) => void
}

export const SensorLogTable: React.FC<SensorLogTableProps> = ({ logs, onRangeFilterChange }) => {
  const [rangeFilter, setRangeFilter] = useState('1 Jam Terakhir')

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setRangeFilter(val)
    onRangeFilterChange?.(val)
  }

  const handleExportCsv = () => {
    const headers = ['ID', 'Waktu', 'Lux', 'Suhu', 'Kelembapan', 'Baterai', 'Sinyal', 'Gateway']
    const rows = logs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.lux}"`,
      `"${l.temperature}"`,
      `"${l.humidity}"`,
      `"${l.battery}"`,
      `"${l.signalQuality}"`,
      `"${l.gatewayStatus}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `sensor-log-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <h3 className="text-base font-bold text-slate-900">Log Sensor Mendalam</h3>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={rangeFilter}
              onChange={handleFilterChange}
              className="appearance-none pl-8 pr-7 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
            >
              <option>1 Jam Terakhir</option>
              <option>24 Jam Terakhir</option>
              <option>7 Hari Terakhir</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            leftIcon={<Download className="w-4 h-4 shrink-0" />}
            className="flex flex-row items-center gap-2 border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 bg-white font-semibold rounded-xl cursor-pointer"
          >
            <span>Ekspor CSV</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4">Intensitas Lux</th>
              <th className="py-3 px-4">Suhu</th>
              <th className="py-3 px-4">RH (Udara)</th>
              <th className="py-3 px-4">Baterai</th>
              <th className="py-3 px-4">Sinyal</th>
              <th className="py-3 px-4 text-right">Status Gateway</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-900">{log.timestamp}</td>
                <td className="py-3 px-4 font-bold text-emerald-800">{log.lux}</td>
                <td className="py-3 px-4 text-slate-700">{log.temperature}</td>
                <td className="py-3 px-4 text-slate-700">{log.humidity}</td>
                <td className="py-3 px-4 text-slate-600">{log.battery}</td>
                <td className="py-3 px-4 text-slate-600">{log.signalQuality}</td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {log.gatewayStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
