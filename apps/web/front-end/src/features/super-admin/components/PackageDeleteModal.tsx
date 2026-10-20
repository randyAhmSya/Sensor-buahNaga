import { type FC } from 'react'
import { AlertCircle, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useDeletePackage } from '@/hooks/useAdmin'
import type { PaketLanggananItem } from '@/types/admin.types'

interface PackageDeleteModalProps {
  isOpen: boolean
  packageItem: PaketLanggananItem | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export const PackageDeleteModal: FC<PackageDeleteModalProps> = ({
  isOpen,
  packageItem,
  onClose,
  onSuccess,
}) => {
  const deleteMutation = useDeletePackage()

  if (!isOpen || !packageItem) return null

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(packageItem.id_paket)
      onSuccess(`Paket langganan ${packageItem.nama_paket} berhasil dihapus dari katalog.`)
      onClose()
    } catch (err: unknown) {
      console.error(err)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-package-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="delete-package-title" className="text-base font-bold text-slate-900">
                Hapus Paket Langganan
              </h2>
              <p className="text-xs text-slate-500">
                Konfirmasi penghapusan paket dari katalog sistem.
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
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus paket{' '}
            <strong className="text-slate-900">{packageItem.nama_paket}</strong>? Paket ini tidak akan dapat dipilih lagi untuk transaksi baru.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" strokeWidth={1.75} />
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Tindakan ini tidak memengaruhi langganan tenant yang sudah aktif sebelumnya. Namun paket ini akan dihapus permanen dari daftar pilihan pembelian baru.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConfirm}
              disabled={deleteMutation.isPending}
              className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Paket'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
