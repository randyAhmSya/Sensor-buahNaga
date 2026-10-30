import { useState, type FC, type FormEvent } from 'react'
import { AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useRejectTransaction } from '@/hooks/useAdmin'

interface TransactionRejectModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string | number
  tenantName: string
  onSuccess: (pesan: string) => void
}

export const TransactionRejectModal: FC<TransactionRejectModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  tenantName,
  onSuccess,
}) => {
  const [alasan, setAlasan] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const { mutate, isPending } = useRejectTransaction()

  const isAlasanValid = alasan.trim().length >= 5

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = alasan.trim()
    if (trimmed.length < 5) {
      setValidationError('Alasan penolakan transaksi wajib diisi minimal 5 karakter.')
      return
    }

    setValidationError(null)
    mutate(
      { id: transactionId, alasan: trimmed },
      {
        onSuccess: () => {
          setAlasan('')
          onSuccess(`Transaksi #${transactionId} dari "${tenantName}" telah ditolak.`)
          onClose()
        },
        onError: (err: unknown) => {
          const apiError = err as {
            response?: { data?: { pesan?: string; errors?: Record<string, string[]> } }
            message?: string
          }
          const serverMsg =
            apiError.response?.data?.errors?.alasan?.[0] ||
            apiError.response?.data?.pesan ||
            apiError.message ||
            'Gagal menolak transaksi langganan.'
          setValidationError(serverMsg)
        },
      }
    )
  }

  const handleClose = () => {
    if (isPending) return
    setAlasan('')
    setValidationError(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tolak Transaksi Pembayaran"
      description={`Berikan alasan mengapa transaksi #${transactionId} dari "${tenantName}" ditolak.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-3 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-900 leading-relaxed">
            Status transaksi akan ditandai ditolak dan alasan akan diinformasikan kepada penyewa untuk perbaikan pembayaran.
          </p>
        </div>

        <div>
          <label htmlFor="alasan-tolak" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Alasan Penolakan <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="alasan-tolak"
            rows={3}
            value={alasan}
            onChange={(e) => {
              setAlasan(e.target.value)
              if (validationError) setValidationError(null)
            }}
            placeholder="Contoh: Bukti transfer tidak terbaca / nominal tidak sesuai dengan tagihan..."
            disabled={isPending}
            className="w-full text-xs text-slate-900 rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className={isAlasanValid ? 'text-slate-500' : 'text-amber-600 font-medium'}>
              Minimal 5 karakter ({alasan.trim().length}/5)
            </span>
          </div>
          {validationError && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {validationError}
            </p>
          )}
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
            type="submit"
            variant="danger"
            size="sm"
            disabled={isPending || !isAlasanValid}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isPending ? 'Menolak...' : 'Tolak Transaksi'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  )
}
