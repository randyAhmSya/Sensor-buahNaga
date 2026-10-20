import { type FC } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useVerifyTransaction } from '@/hooks/useAdmin'

interface TransactionVerifyModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string | number
  tenantName: string
  packageName: string
  onSuccess: (pesan: string) => void
}

export const TransactionVerifyModal: FC<TransactionVerifyModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  tenantName,
  packageName,
  onSuccess,
}) => {
  const { mutate, isPending } = useVerifyTransaction()

  const handleConfirm = () => {
    mutate(
      { id: transactionId },
      {
        onSuccess: () => {
          onSuccess(`Transaksi #${transactionId} untuk paket ${packageName} (${tenantName}) berhasil diverifikasi.`)
          onClose()
        },
      }
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isPending && onClose()}
      title="Verifikasi Transaksi Pembayaran"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <p>
              Anda akan memverifikasi transaksi <strong>#{transactionId}</strong> dari penyewa{' '}
              <strong>{tenantName}</strong> untuk paket <strong>{packageName}</strong>.
            </p>
            <p className="text-emerald-800">
              Masa aktif langganan tenant akan otomatis diperpanjang sesuai kuota paket, dan status transaksi akan dikunci.
            </p>
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
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isPending ? 'Memverifikasi...' : 'Ya, Verifikasi Pembayaran'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
