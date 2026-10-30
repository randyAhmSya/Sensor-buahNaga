import { useState, type FC } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { mutate, isPending } = useVerifyTransaction()

  const handleConfirm = () => {
    setErrorMessage(null)
    mutate(
      { id: transactionId },
      {
        onSuccess: () => {
          setErrorMessage(null)
          onSuccess(`Transaksi #${transactionId} untuk paket ${packageName} (${tenantName}) berhasil diverifikasi.`)
          onClose()
        },
        onError: (err: unknown) => {
          const apiError = err as {
            response?: { status?: number; data?: { pesan?: string } }
            message?: string
          }
          if (apiError.response?.status === 409) {
            setErrorMessage(apiError.response.data?.pesan || 'Konflik status: Transaksi ini telah diproses sebelumnya.')
          } else {
            setErrorMessage(apiError.response?.data?.pesan || apiError.message || 'Gagal memverifikasi transaksi langganan.')
          }
        },
      }
    )
  }

  const handleClose = () => {
    if (isPending) return
    setErrorMessage(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Verifikasi Transaksi Pembayaran"
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl border bg-rose-50 border-rose-200 text-rose-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold text-rose-900">Gagal Memverifikasi Transaksi</p>
              <p className="text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

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
            onClick={handleClose}
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
