import type { FC } from 'react'
import { Info, Sprout } from 'lucide-react'
import { InputField } from '@/components/form/InputField'
import type { CreateFarmInput } from '../schemas/farmSchema'

interface CreateFarmInfoSectionProps {
  formData: CreateFarmInput
  errors: Partial<Record<keyof CreateFarmInput, string>>
  onChange: (field: keyof CreateFarmInput, value: string) => void
}

export const CreateFarmInfoSection: FC<CreateFarmInfoSectionProps> = ({
  formData,
  errors,
  onChange,
}) => {
  return (
    <div>
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <Info className="w-5 h-5 text-emerald-700 shrink-0" />
        <h2 className="text-lg font-bold text-slate-900">Detail Informasi Kebun</h2>
      </div>

      <div className="space-y-5 pt-6">
        {/* Nama Kebun (Wajib) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            Nama Kebun <span className="text-red-500 font-bold ml-1">*</span>
          </label>
          <InputField
            name="name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Contoh: Kebun Buah Naga Pesanggaran"
            error={errors.name}
            leftIcon={<Sprout className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Lokasi / Alamat Lengkap (Wajib) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            Lokasi / Alamat Lengkap <span className="text-red-500 font-bold ml-1">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="Masukkan alamat lengkap kebun..."
            className={`w-full rounded-xl p-3 text-sm font-medium border ${
              errors.location
                ? 'border-rose-500 focus:border-rose-600 bg-rose-50/20 text-rose-900'
                : 'border-slate-300 focus:border-emerald-600 hover:border-slate-400'
            } focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 placeholder:text-slate-400 transition-colors`}
          />
          {errors.location && (
            <p className="text-xs text-rose-600 font-medium">{errors.location}</p>
          )}
        </div>
      </div>
    </div>
  )
}
