import React from 'react'
import { X, Plus, Image as ImageIcon, MapPin, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/form/InputField'
import type { FarmItem } from '@/types/farm'
import { useCreateFarmForm } from '../hooks/useCreateFarmForm'

interface AddFarmModalProps {
  isOpen: boolean
  onClose: () => void
  onAddFarm: (newFarm: FarmItem) => void
}

export const AddFarmModal: React.FC<AddFarmModalProps> = ({ isOpen, onClose, onAddFarm }) => {
  const { formData, errors, handleTextChange, setStatus, handleSubmit } = useCreateFarmForm({
    onAddFarm,
    onClose,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-slate-900">Tambah Kebun Baru</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            name="name"
            label="Nama Kebun *"
            value={formData.name}
            onChange={(e) => handleTextChange('name', e.target.value)}
            placeholder="Contoh: Kebun Buah Naga Banyuwangi"
            error={errors.name}
            leftIcon={<Sprout className="w-4 h-4 text-slate-400" />}
          />

          <InputField
            name="location"
            label="Lokasi Kebun *"
            value={formData.location}
            onChange={(e) => handleTextChange('location', e.target.value)}
            placeholder="Contoh: Pesanggaran, Banyuwangi, Jawa Timur"
            error={errors.location}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
          />

          <InputField
            name="imageUrl"
            label="URL Foto Kebun (Opsional)"
            value={formData.imageUrl || ''}
            onChange={(e) => handleTextChange('imageUrl', e.target.value)}
            placeholder="https://images.unsplash.com/..."
            error={errors.imageUrl}
            leftIcon={<ImageIcon className="w-4 h-4 text-slate-400" />}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Keterangan Kebun <span className="text-rose-600 font-bold ml-0.5">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleTextChange('description', e.target.value)}
              placeholder="Jelaskan jenis tanaman, luasan, atau deskripsi singkat kebun..."
              className={`w-full rounded-xl p-3 text-sm font-medium border ${
                errors.description
                  ? 'border-rose-500 focus:border-rose-600 bg-rose-50/20 text-rose-900'
                  : 'border-slate-300 focus:border-emerald-600 hover:border-slate-400'
              } focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 placeholder:text-slate-400 transition-colors`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 font-medium">{errors.description}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Status Kebun <span className="text-rose-600 font-bold ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Aktif', 'Inaktif'] as const).map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => setStatus(statusOption)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    formData.status === statusOption
                      ? statusOption === 'Aktif'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800'
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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4 shrink-0" />}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex flex-row items-center gap-2 whitespace-nowrap"
            >
              Simpan Kebun
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
