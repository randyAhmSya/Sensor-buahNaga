import { useState, type FC } from 'react'
import {
  Wifi,
  Copy,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface GatewayPairingModalProps {
  isOpen: boolean
  pairingCode: string
  deviceCode: string
  blockName?: string
  onClose: () => void
}

export const GatewayPairingModal: FC<GatewayPairingModalProps> = ({
  isOpen,
  pairingCode,
  deviceCode,
  blockName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(pairingCode)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = pairingCode
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error('Gagal menyalin kode:', err)
    }
  }

  const deviceAndLocation = blockName
    ? `${deviceCode} - ${blockName}`
    : deviceCode

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-200 flex items-start justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Gateway Ditambahkan
              </h3>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                {deviceAndLocation}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Tutup dialog konfirmasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Kotak Kode Pairing Solid Kontras Tinggi */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-lg p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-slate-700 shrink-0" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kode Pairing ESP32
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tracking-wider select-all truncate">
                {pairingCode || 'BELUM-TERSEDIA'}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 border ${
                  copied
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Teks Keterangan Teknis Ringkas */}
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-100 border border-slate-200 rounded-lg p-3.5">
            Masukkan kode ini pada halaman konfigurasi WiFi ESP32. Kode hanya berlaku satu kali dan otomatis hangus setelah gateway terhubung.
          </p>
        </div>

        {/* Footer Modal: Tombol Selesai */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-6 rounded-lg cursor-pointer"
          >
            Selesai
          </Button>
        </div>
      </div>
    </div>
  )
}
