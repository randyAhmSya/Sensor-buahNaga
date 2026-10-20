import { useEffect, useState, type FC } from 'react'
import { FileText, Download, AlertCircle, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { adminService } from '@/services/adminService'

interface TransactionProofModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string | number
  tenantName: string
}

export const TransactionProofModal: FC<TransactionProofModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  tenantName,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let createdUrl: string | null = null

    if (isOpen && transactionId) {
      setIsLoading(true)
      setErrorMessage(null)
      setImageUrl(null)

      adminService
        .getTransactionProofBlobUrl(transactionId)
        .then((url) => {
          if (!active) {
            URL.revokeObjectURL(url)
            return
          }
          createdUrl = url
          setImageUrl(url)
          setIsLoading(false)
        })
        .catch((err: Error) => {
          if (!active) return
          setErrorMessage(err.message || 'Gagal memuat berkas bukti transfer.')
          setIsLoading(false)
        })
    }

    return () => {
      active = false
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [isOpen, transactionId])

  const handleClose = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
      setImageUrl(null)
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bukti Transfer Pembayaran"
      description={`Dokumen bukti transfer transaksi #${transactionId} dari ${tenantName}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="min-h-[300px] max-h-[500px] bg-slate-950/5 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-2 relative">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Mengunduh berkas bukti transfer...</p>
            </div>
          )}

          {errorMessage && !isLoading && (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <p className="text-sm font-semibold text-slate-800">Berkas Tidak Ditemukan</p>
              <p className="text-xs text-slate-500 max-w-xs">{errorMessage}</p>
            </div>
          )}

          {imageUrl && !isLoading && !errorMessage && (
            <div className="w-full flex items-center justify-center overflow-auto max-h-[460px]">
              <img
                src={imageUrl}
                alt={`Bukti Transfer #${transactionId}`}
                className="max-h-[460px] max-w-full rounded-xl object-contain shadow-xs"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Format gambar terverifikasi</span>
          </div>

          <div className="flex items-center gap-2">
            {imageUrl && (
              <a
                href={imageUrl}
                download={`bukti-transfer-${transactionId}.jpg`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas</span>
              </a>
            )}
            <Button type="button" variant="primary" size="sm" onClick={handleClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
