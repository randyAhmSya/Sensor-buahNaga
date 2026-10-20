import { useState, type FC, type FormEvent } from 'react'
import { KeyRound, AlertCircle, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useRequestTenantAccess } from '@/hooks/useAdmin'

interface TenantAccessModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string | number
  tenantName: string
  onSuccess: (pesan: string) => void
}

export const TenantAccessModal: FC<TenantAccessModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  onSuccess,
}) => {
  const [alasan, setAlasan] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const { mutate, isPending } = useRequestTenantAccess()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = alasan.trim()
    if (trimmed.length > 500) {
      setValidationError('Alasan permohonan akses maksimal 500 karakter.')
      return
    }

    setValidationError(null)
    mutate(
      { id: tenantId, alasan: trimmed || undefined },
      {
        onSuccess: () => {
          setAlasan('')
          onSuccess(`Permintaan akses kebun untuk "${tenantName}" berhasil dikirim.`)
          onClose()
        },
        onError: (err: unknown) => {
          const apiErr = err as { pesan?: string; response?: { data?: { pesan?: string } } }
          const message =
            apiErr.response?.data?.pesan ||
            apiErr.pesan ||
            (err instanceof Error ? err.message : 'Gagal mengirim permohonan akses kebun.')
          setValidationError(message)
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
      title="Minta Akses Inspeksi Kebun"
      description={`Kirim permintaan izin ke pengelola "${tenantName}" untuk mengakses data operasional lapangan.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-3 flex items-start gap-3">
          <KeyRound className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-900 leading-relaxed">
            Permintaan ini akan dicatat dalam audit trail. Pengelola kebun akan menerima notifikasi otorisasi inspeksi.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="alasan-akses" className="block text-xs font-semibold text-slate-700">
              Alasan Permintaan Akses <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {alasan.length}/500
            </span>
          </div>
          <textarea
            id="alasan-akses"
            rows={3}
            maxLength={500}
            value={alasan}
            onChange={(e) => {
              setAlasan(e.target.value)
              if (validationError) setValidationError(null)
            }}
            placeholder="Tuliskan tujuan inspeksi (misal: Investigasi kendala sinyal node sensor blok B)..."
            disabled={isPending}
            className="w-full text-xs text-slate-900 rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
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
            variant="primary"
            size="sm"
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isPending ? 'Mengirim...' : 'Kirim Permintaan'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  )
}
