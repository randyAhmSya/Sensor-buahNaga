import { useState, useEffect, type FC, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Radio, Layers, Plus, Camera, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/form/InputField'
import { gatewayService } from '@/services/gatewayService'
import { gatewayKeys } from '@/services/queryKeys'
import type { GatewayBackend } from '@/types/gateway.types'
import { containsMaliciousScript, XSS_ERROR_MESSAGE } from '@/utils/sanitize'
import { QRScannerModal } from '@/components/qr/QRScannerModal'
import { GatewayPairingModal } from './GatewayPairingModal'
import { kodePerangkatSchema } from '@/schemas/deviceCode.schema'
import { resolveKebunGateway, mapCreateGatewayError } from '../utils/kebunGateway'

export interface QuickBlockOption {
  id: string
  name: string
  farmId?: string
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
  const queryClient = useQueryClient()
  const [kodePerangkat, setKodePerangkat] = useState('')
  const [selectedBlockId, setSelectedBlockId] = useState(
    defaultBlockId || (availableBlocks.length > 0 ? availableBlocks[0].id : '')
  )
  const [existingKebunGateway, setExistingKebunGateway] = useState<GatewayBackend | null>(null)
  const [isCheckingGateway, setIsCheckingGateway] = useState(false)
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

  // Cek apakah kebun dari blok terpilih sudah memiliki gateway (1 kebun = 1 gateway)
  useEffect(() => {
    let isMounted = true
    const activeBlock = availableBlocks.find((b) => b.id === selectedBlockId)
    const farmId = activeBlock?.farmId?.trim()

    if (!farmId) {
      setExistingKebunGateway(null)
      return
    }

    setIsCheckingGateway(true)
    gatewayService
      .getAllByKebun(farmId)
      .then((gws) => {
        if (isMounted) {
          const farmBlockIds = availableBlocks
            .filter((b) => b.farmId === farmId)
            .map((b) => b.id)
          const found = resolveKebunGateway(gws, farmId, farmBlockIds)
          setExistingKebunGateway(found)
        }
      })
      .catch(() => {
        if (isMounted) setExistingKebunGateway(null)
      })
      .finally(() => {
        if (isMounted) setIsCheckingGateway(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedBlockId, availableBlocks])

  const activeBlock = availableBlocks.find((b) => b.id === selectedBlockId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmedCode = kodePerangkat.trim()
    const validation = kodePerangkatSchema.safeParse(trimmedCode)
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Kode perangkat tidak valid.')
      return
    }

    if (!selectedBlockId) {
      setError('Pilih blok lahan untuk penempatan gateway.')
      return
    }

    if (containsMaliciousScript(trimmedCode)) {
      setError(XSS_ERROR_MESSAGE)
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const payload = {
        blok_id: selectedBlockId,
        kode_perangkat: trimmedCode,
        status_koneksi: 'belum_terhubung',
      }
      const res = await gatewayService.create(payload)

      // Ambil objek data dari respon sukses API tanpa 'any'
      const resObj = res as { data?: unknown }
      const resData = (
        resObj?.data && typeof resObj.data === 'object' && 'data' in resObj.data
          ? (resObj.data as { data: unknown }).data
          : resObj?.data
      ) as Record<string, unknown> | undefined

      const newId = String(resData?.id_gateway || resData?.id || '')
      if (!newId) {
        throw new Error('Server tidak mengembalikan ID gateway valid.')
      }

      const pairingCode = String(resData?.kode_pairing || '')
      const deviceCode = String(resData?.kode_perangkat || trimmedCode)

      const createdGateway: GatewayBackend = {
        id_gateway: newId,
        blok_id: selectedBlockId,
        kode_perangkat: deviceCode,
        status_koneksi: String(resData?.status_koneksi || 'belum_terhubung'),
        kode_pairing: pairingCode,
      }

      // Invalidate gateway cache (Koreksi 4)
      queryClient.invalidateQueries({ queryKey: gatewayKeys.all })
      if (activeBlock?.farmId) {
        queryClient.invalidateQueries({ queryKey: gatewayKeys.list(activeBlock.farmId) })
      }

      // Tampilkan layar modal konfirmasi pairing ESP32
      setPairingData({
        pairingCode,
        deviceCode,
        blockName: activeBlock
          ? `${activeBlock.name}${activeBlock.farmName ? ` (${activeBlock.farmName})` : ''}`
          : undefined,
        gateway: createdGateway,
      })
    } catch (err: unknown) {
      setError(mapCreateGatewayError(err))
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
        isOpen={isOpen && !pairingData && !isScannerOpen}
        onClose={onClose}
        title={existingKebunGateway ? 'Informasi Gateway Kebun' : 'Tambah Gateway Baru'}
        description={
          existingKebunGateway
            ? 'Kebun ini sudah memiliki gateway IoT terdaftar sesuai aturan satu kebun satu gateway.'
            : 'Daftarkan perangkat gateway IoT untuk menjembatani komunikasi node sensor ke cloud server.'
        }
        maxWidth="md"
      >
        {existingKebunGateway ? (
          <div className="space-y-4 pt-1 text-left">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Kebun Sudah Memiliki Gateway
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-bold">
                  1 Kebun 1 Gateway
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Kebun <strong>{activeBlock?.farmName || ''}</strong> sudah memiliki Gateway IoT aktif. Sesuai aturan sistem, satu kebun hanya boleh memiliki satu gateway dan seluruh node pada kebun ini menggunakan gateway tersebut.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Kode Perangkat:</span>
                <span className="font-mono font-bold text-slate-900">
                  {existingKebunGateway.kode_perangkat}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Status Koneksi:</span>
                <span className="font-semibold text-emerald-700 capitalize">
                  {existingKebunGateway.status_koneksi === 'terhubung' ? 'Terhubung' : 'Belum Terhubung'}
                </span>
              </div>
              {existingKebunGateway.kode_pairing && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Kode Pairing:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {existingKebunGateway.kode_pairing}
                  </span>
                </div>
              )}
            </div>

            {/* Pilihan Blok Lahan jika ingin memeriksa blok lain */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor="quick-select-block" className="block text-xs font-semibold text-slate-700">
                Pilih Blok Lahan:
              </label>
              <div className="relative">
                <select
                  id="quick-select-block"
                  value={selectedBlockId}
                  onChange={(e) => {
                    setSelectedBlockId(e.target.value)
                    if (error) setError(null)
                  }}
                  className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer pr-10"
                >
                  {availableBlocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.farmName ? `(${b.farmName})` : ''}
                    </option>
                  ))}
                </select>
                <Layers className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="md" onClick={onClose}>
                Tutup
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  onSuccess(existingKebunGateway)
                  onClose()
                }}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-xs"
              >
                Gunakan Gateway Ini
              </Button>
            </div>
          </div>
        ) : (
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
              <p className="text-[11px] text-slate-500 mt-1">
                Format: 3 sampai 50 karakter (huruf, angka, strip, garis bawah).
              </p>
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
                  className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer pr-10"
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
              {isCheckingGateway && (
                <p className="text-[11px] text-slate-400 italic">Memeriksa gateway kebun...</p>
              )}
            </div>

            {/* Status Koneksi Info */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Status Awal Gateway: Belum Terhubung</p>
              <p className="mt-0.5 text-slate-400">
                Status akan otomatis dikelola oleh server dan berubah saat perangkat fisik terhubung.
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
        )}
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
