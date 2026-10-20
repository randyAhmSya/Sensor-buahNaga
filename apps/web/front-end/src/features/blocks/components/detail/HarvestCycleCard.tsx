import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, CheckCircle2, Sprout, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface HarvestCycleCardProps {
  harvest: {
    status: string
    lightingStart: string
    floweringTarget: string
    harvestEstimate: string
  }
}

export const HarvestCycleCard: React.FC<HarvestCycleCardProps> = ({ harvest }) => {
  const navigate = useNavigate()
  const isRunning =
    harvest.status === 'Sedang Berjalan' ||
    harvest.status === 'Berjalan' ||
    harvest.status === 'BERJALAN'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Siklus & Target Panen</h3>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isRunning
                ? 'border-emerald-600 bg-white text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            {harvest.status}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Mulai Penyinaran:</span>
            <span className="font-semibold text-slate-800">{harvest.lightingStart}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Target Berbunga:</span>
            <span className="font-semibold text-slate-800">{harvest.floweringTarget}</span>
          </div>

          <div className="flex items-center justify-between py-1 text-slate-800">
            <span className="font-semibold flex items-center gap-1 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              Estimasi Panen:
            </span>
            <span className={`font-bold text-sm ${isRunning ? 'text-emerald-700' : 'text-slate-700'}`}>
              {harvest.harvestEstimate}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant={isRunning ? 'primary' : 'outline'}
          size="md"
          onClick={() => navigate('/kebun/harvests')}
          leftIcon={isRunning ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Plus className="w-4 h-4 shrink-0" />}
          className={`w-full flex flex-row items-center justify-center gap-2 font-semibold py-2.5 rounded-xl shadow-xs cursor-pointer ${
            isRunning
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
              : 'border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 bg-white'
          }`}
        >
          <span>{isRunning ? 'Tandai Panen' : 'Mulai Siklus Panen'}</span>
        </Button>
      </div>
    </div>
  )
}
