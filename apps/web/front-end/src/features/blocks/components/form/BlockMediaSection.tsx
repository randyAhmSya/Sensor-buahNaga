import type { FC, ChangeEvent } from 'react'
import { Image as ImageIcon, UploadCloud } from 'lucide-react'
import { InputField } from '@/components/form/InputField'
import type { BlockFormInput } from '../../schemas/block.schema'

interface BlockMediaSectionProps {
  formData: BlockFormInput
  errors: Partial<Record<keyof BlockFormInput, string>>
  imagePreview: string
  onImageFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onUrlChange: (url: string) => void
  onStatusChange: (status: 'Online' | 'Offline') => void
}

export const BlockMediaSection: FC<BlockMediaSectionProps> = ({
  formData,
  errors,
  imagePreview,
  onImageFileChange,
  onUrlChange,
  onStatusChange,
}) => {
  return (
    <>
      {/* Card Foto Blok */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ImageIcon className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900">
            Foto Blok (Opsional)
          </h3>
        </div>

        <div className="w-full h-48 border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-white transition-all cursor-pointer relative overflow-hidden group">
          {imagePreview || formData.imageUrl ? (
            <img
              src={imagePreview || formData.imageUrl || ''}
              alt="Preview Blok"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-center p-4">
              <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-emerald-700 transition-colors mb-2" />
              <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                Tarik & Lepas Foto Blok
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">atau klik untuk telusuri file</p>
              <p className="text-[10px] text-slate-400 mt-2">JPG, PNG (Maks 5MB)</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onImageFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <InputField
          name="imageUrl"
          label="Atau masukkan tautan URL Foto (Opsional)"
          value={formData.imageUrl || ''}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          error={errors.imageUrl}
        />
      </div>

      {/* Card Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Status Node Perangkat <span className="text-rose-600 font-bold ml-0.5">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['Online', 'Offline'] as const).map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() => onStatusChange(statusOption)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  formData.status === statusOption
                    ? statusOption === 'Online'
                      ? 'border-2 border-emerald-600 bg-white text-emerald-800 shadow-2xs'
                      : 'border-2 border-slate-400 bg-slate-100 text-slate-800'
                    : 'border-2 border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    statusOption === 'Online' ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}
                />
                {statusOption}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
