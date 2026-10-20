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
    ? `${deviceCode} · ${blockName}`
    : deviceCode

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="relative p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-gradient-to-b from-amber-50/50 to-white">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Wifi className="w-6 h-6 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Gateway Ditambahkan
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                {deviceAndLocation}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Tutup dialog konfirmasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Kotak Highlight (Warna Kuning/Warning) */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Kode pairing (masukkan ke ESP32 sekarang)
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="font-mono font-black text-2xl sm:text-3xl text-amber-950 tracking-widest select-all truncate">
                {pairingCode || 'BELUM-TERSEDIA'}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 border ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white hover:bg-amber-100/60 text-amber-900 border-amber-300 hover:border-amber-400'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-700" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Teks Keterangan */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl p-4">
            Kode ini tampil untuk kenyamanan Anda, tapi begitu gateway ini berhasil terhubung, kode ini otomatis hangus. Masukkan ke form WiFi setup di perangkat ESP32 saat pertama kali dinyalakan.
          </p>
        </div>

        {/* Footer Modal: Tombol Selesai */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-8 rounded-xl cursor-pointer shadow-xs"
          >
            Selesai
          </Button>
        </div>
      </div>
    </div>
  )
}
