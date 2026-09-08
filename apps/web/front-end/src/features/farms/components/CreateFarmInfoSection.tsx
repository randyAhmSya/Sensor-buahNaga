import type { FC } from 'react'
import { Info, MapPin, Map, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
        <InputField
          name="name"
          label="Nama Kebun *"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Contoh: Kebun Buah Naga Pesanggaran"
          error={errors.name}
          leftIcon={<Sprout className="w-4 h-4 text-slate-400" />}
        />

        {/* Lokasi / Alamat (Wajib) */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Lokasi / Alamat Lengkap *
          </label>
          <textarea
            rows={3}
            value={formData.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="Masukkan alamat lengkap kebun..."
            className={`w-full rounded-xl p-3 text-sm border ${
              errors.location
                ? 'border-rose-500 focus:border-rose-600'
                : 'border-slate-200 focus:border-emerald-600'
            } focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 transition-colors`}
          />
          {errors.location && (
            <p className="text-xs text-rose-600 font-medium">{errors.location}</p>
          )}
        </div>

        {/* Koordinat GPS (Opsional) */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Koordinat GPS <span className="text-slate-400 font-normal">(Opsional)</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.gpsCoordinates || ''}
                onChange={(e) => onChange('gpsCoordinates', e.target.value)}
                placeholder="-8.591200, 114.283100"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-emerald-600 focus:outline-none text-slate-800"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              leftIcon={<Map className="w-4 h-4 shrink-0" />}
              className="flex flex-row items-center gap-2 border-slate-300 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold whitespace-nowrap"
            >
              <span>Pilih dari Peta</span>
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">
            Digunakan untuk estimasi intensitas sinar matahari dan pemetaan node IoT.
          </p>
        </div>

        {/* Keterangan Kebun (Wajib) */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Keterangan Kebun *
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Jelaskan fase tanaman, varietas buah naga, atau luas lahan..."
            className={`w-full rounded-xl p-3 text-sm border ${
              errors.description
                ? 'border-rose-500 focus:border-rose-600'
                : 'border-slate-200 focus:border-emerald-600'
            } focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400 transition-colors`}
          />
          {errors.description && (
            <p className="text-xs text-rose-600 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Catatan Tambahan (Opsional) */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
          </label>
          <textarea
            rows={2}
            value={formData.additionalNotes || ''}
            onChange={(e) => onChange('additionalNotes', e.target.value)}
            placeholder="Catatan instalasi daya listrik, genset, atau info cadangan..."
            className="w-full rounded-xl p-3 text-sm border border-slate-200 focus:border-emerald-600 focus:outline-none text-slate-800 placeholder-slate-400 transition-colors"
          />
          {errors.additionalNotes && (
            <p className="text-xs text-rose-600 font-medium">{errors.additionalNotes}</p>
          )}
        </div>
      </div>
    </div>
  )
}
