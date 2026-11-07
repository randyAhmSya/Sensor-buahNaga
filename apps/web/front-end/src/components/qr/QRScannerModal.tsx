import React, { useEffect, useRef, useState, useCallback, useId } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import {
  X,
  Camera,
  AlertCircle,
  RefreshCw,
  SwitchCamera,
  CheckCircle2,
  Sparkles,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (decodedText: string) => void
  title?: string
  description?: string
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Pindai QR Code Perangkat',
  description = 'Arahkan kamera ke QR code fisik pada perangkat IoT untuk membaca kode perangkat secara otomatis.',
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isStoppingRef = useRef(false)
  const rawId = useId()
  const containerId = `qr-reader-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Ekstraksi kode perangkat jika QR berupa JSON atau format URL
  const extractDeviceCode = useCallback((raw: string): string => {
    const trimmed = raw.trim()
    try {
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed)
        if (parsed.kode_perangkat) return String(parsed.kode_perangkat).trim()
        if (parsed.kode) return String(parsed.kode).trim()
        if (parsed.device_id) return String(parsed.device_id).trim()
        if (parsed.id) return String(parsed.id).trim()
      }
    } catch {
      // bukan JSON valid, lanjutkan parsing string
    }

    // Jika berupa URL, periksa parameter query atau segmen terakhir
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed)
        const codeParam =
          url.searchParams.get('kode_perangkat') ||
          url.searchParams.get('kode') ||
          url.searchParams.get('code') ||
          url.searchParams.get('id')
        if (codeParam) return codeParam.trim()

        const segments = url.pathname.split('/').filter(Boolean)
        if (segments.length > 0) {
          const last = segments[segments.length - 1]
          if (last.length > 2) return decodeURIComponent(last).trim()
        }
      } catch {
        // fallback ke raw string
      }
    }

    return trimmed
  }, [])

  const stopScanner = useCallback(async () => {
    if (isStoppingRef.current) return
    isStoppingRef.current = true
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        await scannerRef.current.clear()
      }
    } catch (err) {
      console.warn('Gagal menghentikan scanner kamera secara bersih:', err)
    } finally {
      scannerRef.current = null
      isStoppingRef.current = false
    }
  }, [])

  const handleScanSuccessInternal = useCallback(
    async (decodedText: string) => {
      const cleanCode = extractDeviceCode(decodedText)
      if (!cleanCode) return

      setScannedCode(cleanCode)

      // Getar perangkat jika didukung
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(100)
        } catch {
          // ignore
        }
      }

      await stopScanner()

      // Berikan jeda sejenak untuk animasi sukses sebelum menutup modal
      setTimeout(() => {
        onScanSuccess(cleanCode)
        onClose()
      }, 600)
    },
    [extractDeviceCode, stopScanner, onScanSuccess, onClose]
  )

  const startScanner = useCallback(
    async (cameraId?: string) => {
      setIsInitializing(true)
      setErrorMessage(null)
      setScannedCode(null)

      try {
        await stopScanner()

        const element = document.getElementById(containerId)
        if (!element) {
          setIsInitializing(false)
          return
        }

        const html5QrCode = new Html5Qrcode(containerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        })
        scannerRef.current = html5QrCode

        // Dapatkan daftar kamera jika belum ada
        try {
          const devices = await Html5Qrcode.getCameras()
          if (devices && devices.length > 0) {
            setCameras(devices)
          }
        } catch {
          // Abaikan jika browser tidak mengizinkan enumerasi perangkat langsung
        }

        const cameraConfig = cameraId
          ? { deviceId: { exact: cameraId } }
          : { facingMode: 'environment' }

        await html5QrCode.start(
          cameraConfig,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
              const qrboxSize = Math.floor(minEdge * 0.72)
              return { width: qrboxSize, height: qrboxSize }
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleScanSuccessInternal(decodedText)
          },
          () => {
            // Ignore scan parse misses during streaming
          }
        )

        setIsInitializing(false)
      } catch (err: unknown) {
        setIsInitializing(false)
        const msg = (err as Error)?.message || String(err)
        if (msg.includes('NotAllowedError') || msg.includes('Permission denied')) {
          setErrorMessage('Izin akses kamera ditolak. Silakan izinkan akses kamera di peramban Anda.')
        } else if (msg.includes('NotFoundError') || msg.includes('Requested device not found')) {
          setErrorMessage('Tidak ada perangkat kamera yang terdeteksi di perangkat Anda.')
        } else {
          setErrorMessage(`Kamera tidak dapat dimulai (${msg}). Anda juga dapat mengunggah gambar QR.`)
        }
      }
    },
    [stopScanner, handleScanSuccessInternal, containerId]
  )

  useEffect(() => {
    if (!isOpen) return

    isStoppingRef.current = false
    const timer = setTimeout(() => {
      startScanner(selectedCameraId || undefined)
    }, 150)

    return () => {
      clearTimeout(timer)
      stopScanner()
    }
  }, [isOpen, selectedCameraId, startScanner, stopScanner])

  // Pindai gambar file alternatif jika kamera bermasalah
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMessage(null)
    setIsInitializing(true)

    try {
      const html5QrCode = new Html5Qrcode('qr-temp-file-decoder', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })
      const result = await html5QrCode.scanFile(file, true)
      await html5QrCode.clear()
      if (result) {
        handleScanSuccessInternal(result)
      } else {
        setErrorMessage('QR Code tidak terdeteksi dalam foto tersebut.')
      }
    } catch {
      setErrorMessage('Tidak dapat membaca QR code dari gambar yang dipilih.')
    } finally {
      setIsInitializing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId)
    const nextIndex = (currentIndex + 1) % cameras.length
    setSelectedCameraId(cameras[nextIndex].id)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">{title}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Tutup pemindai"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="p-5 flex-1 flex flex-col items-center justify-center overflow-y-auto">
          {/* Container Kamera HTML5-QRCode */}
          <div className="relative w-full max-w-[320px] aspect-square rounded-xl overflow-hidden bg-slate-950 shadow-inner border border-slate-800 flex items-center justify-center">
            <div id={containerId} className="w-full h-full object-cover" />

            {/* Hidden container untuk file upload parsing */}
            <div id="qr-temp-file-decoder" className="hidden" />

            {/* Overlay Frame & Laser Animasi */}
            {!errorMessage && !scannedCode && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {/* Kotak bidik */}
                <div className="relative w-[72%] h-[72%] border-2 border-emerald-400/80 rounded-2xl shadow-lg shadow-emerald-500/10">
                  {/* Sudut reticle */}
                  <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-md" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-md" />
                  <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-md" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-md" />

                  {/* Garis laser pemindai */}
                  <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-md shadow-emerald-400 animate-bounce duration-1000" />
                </div>
              </div>
            )}

            {/* Indikator Memuat Kamera */}
            {isInitializing && !errorMessage && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-2">
                <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-slate-300">Menghubungkan kamera...</span>
              </div>
            )}

            {/* Tampilan Berhasil Membaca QR */}
            {scannedCode && (
              <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">QR Terbaca!</p>
                <p className="text-sm font-mono font-bold mt-1 text-white bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-500/30 max-w-[260px] truncate">
                  {scannedCode}
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {errorMessage && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-5 text-center text-white space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-rose-200 leading-relaxed px-2">{errorMessage}</p>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startScanner(selectedCameraId || undefined)}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs py-1.5 cursor-pointer"
                  >
                    Coba Lagi
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Kontrol Tambahan: Ganti Kamera / Unggah Gambar */}
          <div className="flex items-center gap-2 mt-4">
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <SwitchCamera className="w-3.5 h-3.5 text-slate-500" />
                <span>Ganti Kamera</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Pindai Foto Galeri</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Pastikan QR code berada tepat di dalam kotak bidik dan memiliki pencahayaan cukup.</span>
          </p>
        </div>

        {/* Footer Modal */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleClose}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
          >
            Batal
          </Button>
        </div>
      </div>
    </div>
  )
}
