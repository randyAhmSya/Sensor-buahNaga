import type { FC, ChangeEvent } from 'react'
import { Image as ImageIcon, UploadCloud } from 'lucide-react'
import type { CreateFarmInput } from '../schemas/farmSchema'

interface CreateFarmMediaSectionProps {
  formData: CreateFarmInput
  errors: Partial<Record<keyof CreateFarmInput, string>>
  imagePreview: string
  onImageFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onStatusChange: (status: 'Aktif' | 'Inaktif') => void
  onCancel?: () => void
}

export const CreateFarmMediaSection: FC<CreateFarmMediaSectionProps> = ({
  formData,
  errors,
  imagePreview,
  onImageFileChange,
  onStatusChange,
}) => {
  return (
    <>
      {/* Card Upload Foto Utama */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ImageIcon className="w-4 h-4 text-emerald-700" />
          <h3 className="text-base font-bold text-slate-900">
            Foto Utama Kebun <span className="text-xs font-normal text-slate-500 ml-1">(Opsional)</span>
          </h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
            File Foto Kebun <span className="text-slate-400 font-normal ml-1">(Maks 2MB)</span>
          </label>
          <div className="flex-1 min-h-48 border-2 border-dashed border-slate-200 hover:border-emerald-600 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer relative overflow-hidden group">
            {imagePreview || formData.imageUrl ? (
              <img
                src={imagePreview || formData.imageUrl || ''}
                alt="Preview Kebun"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-emerald-700 transition-colors mb-2" />
                <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                  Tarik & Lepas Foto
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">atau klik untuk menelusuri file</p>
                <p className="text-[10px] text-slate-400 mt-2">JPG, PNG (Maks 2MB)</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onImageFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {errors.imageUrl && (
            <p className="text-xs text-rose-600 font-medium mt-1">{errors.imageUrl}</p>
          )}
        </div>
      </div>

      {/* Card Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
            Status Operasional Kebun <span className="text-rose-600 font-bold ml-0.5">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['Aktif', 'Inaktif'] as const).map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() => onStatusChange(statusOption)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  formData.status === statusOption
                    ? statusOption === 'Aktif'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 shadow-2xs'
                      : 'border-slate-400 bg-slate-100 text-slate-800'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    statusOption === 'Aktif' ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}
                />
                {statusOption}
              </button>
            ))}
          </div>
          {errors.status && (
            <p className="text-xs text-rose-600 font-medium">{errors.status}</p>
          )}
        </div>
      </div>
    </>
  )
}
