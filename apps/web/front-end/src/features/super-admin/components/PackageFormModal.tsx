import { useState, useEffect, type FC, type FormEvent } from 'react'
import { X, Package, Calendar, Banknote, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreatePackage, useUpdatePackage } from '@/hooks/useAdmin'
import type { PaketLanggananItem, CreatePackagePayload, UpdatePackagePayload } from '@/types/admin.types'

interface PackageFormModalProps {
  isOpen: boolean
  packageItem: PaketLanggananItem | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export const PackageFormModal: FC<PackageFormModalProps> = ({
  isOpen,
  packageItem,
  onClose,
  onSuccess,
}) => {
  const [namaPaket, setNamaPaket] = useState('')
  const [tambahanHari, setTambahanHari] = useState<number | string>(30)
  const [harga, setHarga] = useState<number | string>(500000)
  const [statusAktif, setStatusAktif] = useState(true)
  const [keterangan, setKeterangan] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = Boolean(packageItem)

  const createMutation = useCreatePackage()
  const updateMutation = useUpdatePackage()

  useEffect(() => {
    if (packageItem) {
      setNamaPaket(packageItem.nama_paket || '')
      setTambahanHari(packageItem.tambahan_hari || 30)
      setHarga(packageItem.harga || 0)
      setStatusAktif(Boolean(packageItem.status_aktif))
      setKeterangan(packageItem.keterangan || '')
      setErrors({})
    } else {
      setNamaPaket('')
      setTambahanHari(30)
      setHarga(500000)
      setStatusAktif(true)
      setKeterangan('')
      setErrors({})
    }
  }, [packageItem, isOpen])

  if (!isOpen) return null

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!namaPaket.trim()) {
      errs.nama_paket = 'Nama paket wajib diisi.'
    }
    const days = Number(tambahanHari)
    if (isNaN(days) || days <= 0) {
      errs.tambahan_hari = 'Tambahan hari harus lebih besar dari 0.'
    }
    const price = Number(harga)
    if (isNaN(price) || price < 0) {
      errs.harga = 'Harga paket tidak boleh kurang dari 0.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const days = Number(tambahanHari)
    const price = Number(harga)

    if (isEdit && packageItem) {
      const payload: UpdatePackagePayload = {
        nama_paket: namaPaket.trim(),
        tambahan_hari: days,
        harga: price,
        status_aktif: statusAktif,
        keterangan: keterangan.trim() || undefined,
      }
      try {
        await updateMutation.mutateAsync({
          id: packageItem.id_paket,
          payload,
        })
        onSuccess(`Paket langganan ${namaPaket} berhasil diperbarui.`)
        onClose()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memperbarui paket langganan.'
        setErrors((prev) => ({ ...prev, general: msg }))
      }
    } else {
      const payload: CreatePackagePayload = {
        nama_paket: namaPaket.trim(),
        tambahan_hari: days,
        harga: price,
        status_aktif: statusAktif,
        keterangan: keterangan.trim() || undefined,
      }
      try {
        await createMutation.mutateAsync(payload)
        onSuccess(`Paket langganan ${namaPaket} berhasil ditambahkan ke katalog.`)
        onClose()
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal menambahkan paket langganan.'
        setErrors((prev) => ({ ...prev, general: msg }))
      }
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-modal-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="package-modal-title" className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Paket Langganan' : 'Tambah Paket Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Konfigurasikan masa aktif durasi dan tarif biaya paket langganan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errors.general && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800">
              {errors.general}
            </div>
          )}

          {/* Nama Paket */}
          <div>
            <label htmlFor="package_name" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Paket <span className="text-slate-400">*</span>
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
              <input
                id="package_name"
                type="text"
                value={namaPaket}
                onChange={(e) => setNamaPaket(e.target.value)}
                placeholder="Contoh: Paket Standar 30 Hari"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {errors.nama_paket && (
              <p className="text-[11px] text-slate-600 mt-1">{errors.nama_paket}</p>
            )}
          </div>

          {/* Durasi Hari & Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="package_days" className="block text-xs font-semibold text-slate-700 mb-1">
                Durasi Tambahan Hari <span className="text-slate-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
                <input
                  id="package_days"
                  type="number"
                  min="1"
                  value={tambahanHari}
                  onChange={(e) => setTambahanHari(e.target.value)}
                  placeholder="30"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              {errors.tambahan_hari && (
                <p className="text-[11px] text-slate-600 mt-1">{errors.tambahan_hari}</p>
              )}
            </div>

            <div>
              <label htmlFor="package_price" className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Paket (IDR) <span className="text-slate-400">*</span>
              </label>
              <div className="relative">
                <Banknote className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
                <input
                  id="package_price"
                  type="number"
                  min="0"
                  step="1000"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="500000"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              {errors.harga && (
                <p className="text-[11px] text-slate-600 mt-1">{errors.harga}</p>
              )}
            </div>
          </div>

          {/* Keterangan / Fitur */}
          <div>
            <label htmlFor="package_desc" className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Paket
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
              <textarea
                id="package_desc"
                rows={3}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Rincian fitur atau fasilitas paket perkebunan ini..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Status Aktif Switch */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Status Publikasi Katalog</span>
              <span className="text-[11px] text-slate-500">
                {statusAktif
                  ? 'Paket aktif dan dapat dipilih oleh tenant mitra.'
                  : 'Paket disembunyikan dari daftar pembelian tenant.'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={statusAktif}
                onChange={(e) => setStatusAktif(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Paket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
