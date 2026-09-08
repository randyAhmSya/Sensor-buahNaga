import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FarmDetailHeaderProps {
  name: string
  location: string
  status: 'Aktif' | 'Inaktif'
  bannerUrl: string
}

export const FarmDetailHeader: React.FC<FarmDetailHeaderProps> = ({
  name,
  location,
  status,
  bannerUrl,
}) => {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate('/admin/farms')}
        className="flex flex-row items-center gap-2 text-slate-600 hover:text-emerald-700 text-sm font-semibold transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Kembali ke Daftar Kebun</span>
      </button>

      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
        <img
          src={bannerUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
      </div>

      {/* Floating Info Box */}
      <div className="-mt-14 md:-mt-10 relative z-10 px-3 md:px-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">{name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  status === 'Aktif'
                    ? 'bg-white border-emerald-600 text-emerald-700'
                    : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === 'Aktif' ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}
                />
                {status}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{location}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<Pencil className="w-4 h-4 shrink-0" />}
            className="flex flex-row items-center justify-center gap-2 border-slate-300 text-slate-700 hover:border-emerald-600 hover:text-emerald-700 hover:bg-white font-semibold whitespace-nowrap"
          >
            Edit Kebun
          </Button>
        </div>
      </div>
    </div>
  )
}
