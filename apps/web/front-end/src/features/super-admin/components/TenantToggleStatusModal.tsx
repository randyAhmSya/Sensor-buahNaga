import { type FC } from 'react'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToggleTenantStatus } from '@/hooks/useAdmin'

interface TenantToggleStatusModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string | number
  tenantName: string
  isCurrentlyActive: boolean
  onSuccess: (pesan: string) => void
}

export const TenantToggleStatusModal: FC<TenantToggleStatusModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  isCurrentlyActive,
  onSuccess,
}) => {
  const { mutate, isPending } = useToggleTenantStatus()

  const handleConfirm = () => {
    const nextActivate = !isCurrentlyActive
    mutate(
      { id: tenantId, activate: nextActivate },
      {
        onSuccess: () => {
          onSuccess(
            nextActivate
              ? `Tenant "${tenantName}" berhasil diaktifkan kembali.`
              : `Tenant "${tenantName}" berhasil dinonaktifkan.`
          )
          onClose()
        },
      }
    )
  }

  const title = isCurrentlyActive ? 'Nonaktifkan Tenant' : 'Aktifkan Kembali Tenant'

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isPending && onClose()}
      title={title}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isCurrentlyActive
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {isCurrentlyActive ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed">
            {isCurrentlyActive ? (
              <p>
                Menonaktifkan tenant <strong>{tenantName}</strong> akan menangguhkan akses pengguna
                organisasi tersebut ke modul kebun dan telemetri perangkat hingga diaktifkan kembali.
              </p>
            ) : (
              <p>
                Mengaktifkan kembali tenant <strong>{tenantName}</strong> akan memulihkan akses penuh
                ke seluruh fitur operasional sesuai sisa paket langganan aktif.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant={isCurrentlyActive ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            disabled={isPending}
            className={`font-semibold flex items-center gap-2 ${
              isCurrentlyActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {isPending
                ? 'Memproses...'
                : isCurrentlyActive
                ? 'Ya, Nonaktifkan'
                : 'Ya, Aktifkan'}
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
