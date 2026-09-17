import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lamp, Sliders, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface LightingScheduleCardProps {
  schedule: {
    activeCycle: string
    intensity: string
  }
}

export const LightingScheduleCard: React.FC<LightingScheduleCardProps> = ({ schedule }) => {
  const navigate = useNavigate()
  const hasActiveSchedule = schedule.activeCycle && schedule.activeCycle !== 'Belum Ada Jadwal'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lamp className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">Jadwal Pencahayaan</h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
              hasActiveSchedule
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Moon className="w-3 h-3" />
            {hasActiveSchedule ? 'Malam' : 'Inaktif'}
          </span>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Siklus</span>
            <span className="text-sm font-bold text-slate-900">{schedule.activeCycle}</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Intensitas Daya</span>
            <span className={`text-sm font-bold ${hasActiveSchedule ? 'text-emerald-700' : 'text-slate-400'}`}>
              {schedule.intensity}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => navigate('/admin/schedules')}
          leftIcon={<Sliders className="w-4 h-4 shrink-0" />}
          className="w-full flex flex-row items-center justify-center gap-2 border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 bg-white font-semibold py-2.5 rounded-xl cursor-pointer"
        >
          <span>{hasActiveSchedule ? 'Atur Jadwal' : 'Buat Jadwal Baru'}</span>
        </Button>
      </div>
    </div>
  )
}
