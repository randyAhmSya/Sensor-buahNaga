import { useState, useEffect, type FC, type FormEvent } from 'react'
import { Radio, Layers, Plus, Camera } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/form/InputField'
import { gatewayService } from '@/services/gatewayService'
import type { GatewayBackend } from '@/types/gateway.types'
import { containsMaliciousScript, XSS_ERROR_MESSAGE } from '@/utils/sanitize'
import { QRScannerModal } from '@/components/qr/QRScannerModal'
import { GatewayPairingModal } from './GatewayPairingModal'

export interface QuickBlockOption {
  id: string
  name: string
  farmName?: string
}

interface QuickAddGatewayModalProps {
  isOpen: boolean
  availableBlocks: QuickBlockOption[]
  defaultBlockId?: string
  onClose: () => void
  onSuccess: (newGateway: GatewayBackend) => void
}

export const QuickAddGatewayModal: FC<QuickAddGatewayModalProps> = ({
  isOpen,
  availableBlocks,
  defaultBlockId,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null

  return (
    <QuickAddGatewayModalContent
      isOpen={isOpen}
      availableBlocks={availableBlocks}
      defaultBlockId={defaultBlockId}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

interface PairingSuccessData {
  pairingCode: string
  deviceCode: string
  blockName?: string
  gateway: GatewayBackend
}

const QuickAddGatewayModalContent: FC<QuickAddGatewayModalProps> = ({
  isOpen,
  availableBlocks,
  defaultBlockId,
  onClose,
  onSuccess,
}) => {
  const [kodePerangkat, setKodePerangkat] = useState('')
  const [selectedBlockId, setSelectedBlockId] = useState(
    defaultBlockId || (availableBlocks.length > 0 ? availableBlocks[0].id : '')
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [pairingData, setPairingData] = useState<PairingSuccessData | null>(null)

  useEffect(() => {
    if (defaultBlockId) {
      setSelectedBlockId(defaultBlockId)
    } else if (availableBlocks.length > 0) {
      setSelectedBlockId(availableBlocks[0].id)
    }
    setKodePerangkat('')
    setError(null)
    setPairingData(null)
  }, [isOpen, defaultBlockId, availableBlocks])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!kodePerangkat.trim()) {
      setError('Kode perangkat gateway wajib diisi.')
      return
    }

    if (!selectedBlockId) {
      setError('Pilih blok lahan untuk penempatan gateway.')
      return
    }

    if (containsMaliciousScript(kodePerangkat)) {
      setError(XSS_ERROR_MESSAGE)
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const payload = {
        blok_id: selectedBlockId,
        kode_perangkat: kodePerangkat.trim(),
        status_koneksi: 'belum_terhubung',
      }
      const res = await gatewayService.create(payload)

      // Ambil objek data dari respon sukses API (mendukung ApiResponse axios / fetch)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = (res as any)?.data?.data || (res as any)?.data || res
      const pairingCode =
        responseData?.kode_pairing ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (res as any)?.kode_pairing ||
        ''
      const deviceCode =
        responseData?.kode_perangkat ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (res as any)?.kode_perangkat ||
        payload.kode_perangkat

      const createdGateway: GatewayBackend = {
        id_gateway: responseData?.id_gateway || responseData?.id || `gtw-${Date.now()}`,
        blok_id: selectedBlockId,
        kode_perangkat: deviceCode,
        status_koneksi: responseData?.status_koneksi || 'belum_terhubung',
        kode_pairing: pairingCode,
      }

      const activeBlock = availableBlocks.find((b) => b.id === selectedBlockId)

      // PENTING: Cegah auto-close langsung. Tampilkan layar modal konfirmasi pairing ESP32
      setPairingData({
        pairingCode,
        deviceCode,
        blockName: activeBlock ? `${activeBlock.name}${activeBlock.farmName ? ` (${activeBlock.farmName})` : ''}` : undefined,
        gateway: createdGateway,
      })
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Gagal menambahkan gateway baru.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler saat teknisi menyelesaikan proses penyalinan kode pairing
  const handleFinishPairing = () => {
    if (pairingData) {
      onSuccess(pairingData.gateway)
    }
    setPairingData(null)
    setKodePerangkat('')
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen && !pairingData}
        onClose={onClose}
        title="Tambah Gateway Baru"
        description="Daftarkan perangkat gateway IoT untuk menjembatani komunikasi node sensor ke cloud server."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-left">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Kode Perangkat Gateway & Tombol Scan QR */}
          <div>
            <InputField
              label="Kode Perangkat Gateway"
              name="kodePerangkat"
              value={kodePerangkat}
              onChange={(e) => {
                setKodePerangkat(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Contoh: GTW-BLOK-A-01"
              leftIcon={<Radio className="w-4 h-4 text-slate-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  title="Buka kamera untuk scan QR"
                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Buka kamera untuk scan QR"
                >
                  <Camera className="w-4 h-4" />
                </button>
              }
              required
            />
          </div>

          {/* Penempatan Blok */}
          <div className="space-y-1.5">
            <label htmlFor="quick-select-block" className="block text-sm font-semibold text-slate-800">
              Penempatan Blok Lahan <span className="text-rose-600 font-bold ml-0.5">*</span>
            </label>
            <div className="relative">
              <select
                id="quick-select-block"
                value={selectedBlockId}
                onChange={(e) => {
                  setSelectedBlockId(e.target.value)
                  if (error) setError(null)
                }}
                required
                className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 cursor-pointer pr-10"
              >
                <option value="">-- Pilih Blok Lahan --</option>
                {availableBlocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.farmName ? `(${b.farmName})` : ''}
                  </option>
                ))}
              </select>
              <Layers className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status Koneksi Info */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Status Awal Gateway: Belum Terhubung</p>
            <p className="mt-0.5 text-slate-400">
              Status akan otomatis berubah menjadi "Terhubung" saat perangkat fisik tersambung ke internet.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-xs"
            >
              Simpan Gateway
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Scanner Kamera QR Code */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(scanned) => {
          setKodePerangkat(scanned)
          if (error) setError(null)
        }}
        title="Scan QR Code Gateway"
        description="Arahkan kamera ke barcode/QR Code pada casing perangkat Gateway IoT"
      />

      {/* Layar / Modal Konfirmasi Pairing ESP32 */}
      {pairingData && (
        <GatewayPairingModal
          isOpen={Boolean(pairingData)}
          pairingCode={pairingData.pairingCode}
          deviceCode={pairingData.deviceCode}
          blockName={pairingData.blockName}
          onClose={handleFinishPairing}
        />
      )}
    </>
  )
}
