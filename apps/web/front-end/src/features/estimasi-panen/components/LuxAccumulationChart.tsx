import type { BlokHarvestDTO } from '../../../types/database.types'
import { formatLuxHours, formatDate } from '../../../utils/formatters'
import { SunMedium } from 'lucide-react'

interface LuxAccumulationChartProps {
  blocks: BlokHarvestDTO[]
}

export function LuxAccumulationChart({ blocks }: LuxAccumulationChartProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <SunMedium className="h-5 w-5 text-amber-500" />
            Akumulasi Radiasi & Dosis Cahaya (Lux-Jam) Per Blok
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Komparasi kumulatif pencahayaan LED malam terhadap target fotosintesis induksi panen
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-emerald-600" />
            <span className="text-slate-600">Tercapai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-slate-200" />
            <span className="text-slate-600">Target Defisit</span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {blocks.map((block) => {
          const percentage = Math.min(100, (block.akumulasi_lux_jam / block.target_lux_jam) * 100)
          return (
            <div key={block.id_blok} className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <span className="font-semibold text-slate-800">{block.nama_blok}</span>
                <span className="text-slate-500 font-mono">
                  {formatLuxHours(block.akumulasi_lux_jam)} / {formatLuxHours(block.target_lux_jam)} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="relative h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Fase: {block.status_siklus}</span>
                <span>Estimasi Panen: {formatDate(block.estimasi_tanggal_panen)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
