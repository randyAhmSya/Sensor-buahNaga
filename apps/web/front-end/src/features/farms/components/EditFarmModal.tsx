import React, { useState, useEffect } from 'react'
import { X, Save, Image as ImageIcon, MapPin, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/form/InputField'
import type { FarmItem } from '@/types/farm.types'
import { farmService } from '@/services/farmService'

interface EditFarmModalProps {
  isOpen: boolean
  farm: FarmItem | null
  onClose: () => void
  onSuccess: (updatedFarm: FarmItem) => void
}

export const EditFarmModal: React.FC<EditFarmModalProps> = ({
  isOpen,
  farm,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<'Aktif' | 'Inaktif'>('Aktif')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (farm) {
      setName(farm.name || '')
      setLocation(farm.location || '')
      setDescription(farm.description || '')
      setImageUrl(farm.imageUrl || '')
      setStatus(farm.status === 'Aktif' ? 'Aktif' : 'Inaktif')
      setError(null)
    }
  }, [farm, isOpen])

  if (!isOpen || !farm) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nama kebun wajib diisi.')
      return
    }
    if (!location.trim()) {
      setError('Lokasi kebun wajib diisi.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await farmService.update(farm.id, {
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        status: status,
      })

      const updatedFarm: FarmItem = {
        ...farm,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        status: status,
      }

      onSuccess(updatedFarm)
      onClose()
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Gagal menyimpan perubahan kebun.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-slate-900">Edit Kebun</h3>
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

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            name="name"
            label="Nama Kebun *"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Contoh: Kebun Buah Naga Banyuwangi"
            leftIcon={<Sprout className="w-4 h-4 text-slate-400" />}
            required
          />

          <InputField
            name="location"
            label="Lokasi Kebun *"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Contoh: Pesanggaran, Banyuwangi, Jawa Timur"
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            required
          />

          <InputField
            name="imageUrl"
            label="URL Foto Kebun (Opsional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            leftIcon={<ImageIcon className="w-4 h-4 text-slate-400" />}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Keterangan Kebun <span className="text-slate-400 font-normal text-xs ml-1">(Opsional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan jenis tanaman, luasan, atau deskripsi singkat kebun..."
              className="w-full rounded-xl p-3 text-sm font-medium border border-slate-300 focus:border-emerald-600 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900 placeholder:text-slate-400 transition-colors"
            />
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
                    status === statusOption
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
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4 shrink-0" />}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex flex-row items-center gap-2 whitespace-nowrap shadow-xs"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
