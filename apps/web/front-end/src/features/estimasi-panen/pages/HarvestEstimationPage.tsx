import mockHarvestData from '../../../services/mock/mockHarvest.json'
import type { BlokHarvestDTO } from '../../../types/database.types'
import { HarvestProgressRing } from '../components/HarvestProgressRing'
import { LuxAccumulationChart } from '../components/LuxAccumulationChart'
import { Card, CardContent } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Sprout, Calendar, Lightbulb, TrendingUp } from 'lucide-react'
import { formatDate } from '../../../utils/formatters'

export function HarvestEstimationPage() {
  const blocks = mockHarvestData as unknown as BlokHarvestDTO[]

  const getPhaseBadgeVariant = (phase: string) => {
    if (phase === 'Pematangan') return 'success'
    if (phase.includes('Tunas')) return 'warning'
    return 'info'
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Sprout className="h-6 w-6 text-emerald-600" />
          Estimasi Panen & Akumulasi Dosis Cahaya
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kalkulasi proyeksi tanggal panen buah naga berbasis model akumulasi Lux-Jam fotoperiodik
        </p>
      </div>

      {/* Overview Block Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {blocks.map((block) => (
          <Card key={block.id_blok} className="relative overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{block.nama_blok}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {block.id_blok} &bull; {block.varietas_naga}
                  </p>
                </div>
                <Badge variant={getPhaseBadgeVariant(block.status_siklus)}>
                  {block.status_siklus}
                </Badge>
              </div>

              <div className="mt-5 flex items-center justify-around py-3 bg-slate-50 rounded-xl">
                <HarvestProgressRing progress={block.progres_persen} size={90} strokeWidth={8} />

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Estimasi Panen:</span>
                    <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(block.estimasi_tanggal_panen)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Kepadatan Pohon:</span>
                    <span className="font-semibold text-slate-700">{block.jumlah_tiang} Tiang</span>
                  </div>
                  {block.target_brix && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Target Kemanisan (Brix):</span>
                      <span className="font-semibold text-amber-600">~{block.target_brix}° Brix</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Status Lampu:
                </span>
                <span className="font-medium text-slate-800">{block.status_pencahayaan}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Visualization */}
      <LuxAccumulationChart blocks={blocks} />

      {/* Agronomic Insight Card */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5 flex items-start gap-3.5">
        <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="text-xs text-emerald-950 space-y-1 leading-relaxed">
          <h4 className="font-bold text-sm text-emerald-900">Rekomendasi Agronomi Pencahayaan</h4>
          <p>
            Blok dengan progres &ge; 95% (seperti <strong>Blok Naga Merah Super A1</strong>) telah memasuki fase pematangan penuh. 
            Lampu LED malam otomatis dinonaktifkan untuk menjaga kadar glukosa alami dan mencegah kerontokan sisik buah sebelum petik.
          </p>
        </div>
      </div>
    </div>
  )
}
