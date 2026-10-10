import { useState, useEffect, useMemo, useRef, type FC, type FormEvent } from 'react'
import { Radio, Cpu, Plus, Layers, Network } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/form/InputField'
import { farmService } from '@/services/farmService'
import { gatewayService } from '@/services/gatewayService'
import type { FarmItem } from '@/types/farm.types'
import type { GatewayBackend } from '@/types/gateway.types'
import type { CreateNodePayload } from '@/types/node.types'
import { QuickAddGatewayModal, type QuickBlockOption } from './QuickAddGatewayModal'
import { containsMaliciousScript, XSS_ERROR_MESSAGE } from '@/utils/sanitize'

interface AddSensorModalProps {
  isOpen: boolean
  isSubmitting: boolean
  farms?: FarmItem[]
  onClose: () => void
  onSubmit: (payload: CreateNodePayload) => Promise<void>
}

export const AddSensorModal: FC<AddSensorModalProps> = ({
  isOpen,
  isSubmitting,
  farms: externalFarms,
  onClose,
  onSubmit,
}) => {
  // Cegah rendering modal atau inisialisasi state jika modal tertutup
  if (!isOpen) return null

  return (
    <AddSensorModalContent
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      initialFarms={externalFarms}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

interface AddSensorModalContentProps {
  isOpen: boolean
  isSubmitting: boolean
  initialFarms?: FarmItem[]
  onClose: () => void
  onSubmit: (payload: CreateNodePayload) => Promise<void>
}

const AddSensorModalContent: FC<AddSensorModalContentProps> = ({
  isOpen,
  isSubmitting,
  initialFarms,
  onClose,
  onSubmit,
}) => {
  const [farms, setFarms] = useState<FarmItem[]>(initialFarms || [])
  const [gateways, setGateways] = useState<GatewayBackend[]>([])
  const [isLoadingGateways, setIsLoadingGateways] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string>('')
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('')
  const [kodePerangkat, setKodePerangkat] = useState<string>('')
  const [tipeSensor, setTipeSensor] = useState<string>('lux_suhu')
  const [statusKoneksi, setStatusKoneksi] = useState<'aktif' | 'nonaktif'>('aktif')
  const [isQuickGatewayOpen, setIsQuickGatewayOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<string | null>(null)

  const hasFetchedFarmsRef = useRef(false)

  // 1. Muat data kebun dan blok HANYA sekali saat modal dibuka (jika belum dioper dari props)
  useEffect(() => {
    if (initialFarms && initialFarms.length > 0) {
      setFarms(initialFarms)
      return
    }

    if (!hasFetchedFarmsRef.current) {
      hasFetchedFarmsRef.current = true
      farmService
        .getAll()
        .then((data) => {
          setFarms(data || [])
        })
        .catch(() => {
          setFarms([])
        })
    }
  }, [initialFarms])

  // 2. Fetch gateway dari GET /api/petani/gateway (dengan opsional blok_id jika dipilih)
  useEffect(() => {
    let isMounted = true
    setIsLoadingGateways(true)

    gatewayService
      .getAll(selectedBlockId ? { blok_id: selectedBlockId } : undefined)
      .then((data) => {
        if (!isMounted) return
        setGateways(data || [])
        // Pastikan pilihan gateway tetap sinkron
        setSelectedGatewayId((prev) => {
          if (data && data.some((g) => (g.id_gateway || g.id) === prev)) {
            return prev
          }
          return ''
        })
      })
      .catch(() => {
        if (isMounted) setGateways([])
      })
      .finally(() => {
        if (isMounted) setIsLoadingGateways(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedBlockId])

  // Flatten daftar semua blok untuk dropdown & quick add gateway
  const availableBlocks: QuickBlockOption[] = useMemo(() => {
    return farms.flatMap((farm) =>
      (farm.blocks || []).map((b) => ({
        id: b.id,
        name: b.name,
        farmName: farm.name,
      }))
    )
  }, [farms])

  const handleQuickGatewaySuccess = (newGateway: GatewayBackend) => {
    const newGtwId = newGateway.id_gateway || newGateway.id || ''
    // Jika gateway baru dibuat di blok yang berbeda, arahkan selectedBlockId ke blok tersebut
    if (newGateway.blok_id && newGateway.blok_id !== selectedBlockId) {
      setSelectedBlockId(newGateway.blok_id)
    }
    setGateways((prev) => [newGateway, ...prev.filter((g) => (g.id_gateway || g.id) !== newGtwId)])
    setSelectedGatewayId(newGtwId)
    setSuccessInfo(`Gateway "${newGateway.kode_perangkat}" berhasil ditambahkan dan dipilih otomatis.`)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!kodePerangkat.trim()) {
      setError('Kode perangkat / nama node sensor wajib diisi.')
      return
    }

    if (containsMaliciousScript(kodePerangkat) || containsMaliciousScript(tipeSensor)) {
      setError(XSS_ERROR_MESSAGE)
      return
    }

    try {
      const payload: CreateNodePayload = {
        kode_perangkat: kodePerangkat.trim(),
        blok_id: selectedBlockId ? selectedBlockId : null,
        gateway_id: selectedGatewayId ? selectedGatewayId : null,
        tipe_sensor: tipeSensor.trim(),
        status_koneksi: statusKoneksi,
      }
      await onSubmit(payload)
      setKodePerangkat('')
      setError(null)
      onClose()
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Gagal menambahkan node sensor baru.')
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Tambah Node Sensor Baru"
        description="Daftarkan perangkat node IoT baru untuk memantau intensitas cahaya lux dan kondisi lingkungan blok lahan."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-left">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {successInfo && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {successInfo}
            </div>
          )}

          {/* Kode Perangkat / Nama Node */}
          <InputField
            label="Kode Perangkat Node Sensor"
            name="kodePerangkat"
            value={kodePerangkat}
            onChange={(e) => {
              setKodePerangkat(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Contoh: SNS-BLOK-A-01"
            leftIcon={<Radio className="w-4 h-4 text-slate-400" />}
            required
          />

          {/* Baris Pilihan Blok & Gateway (Layout Simetris & Terkoordinasi) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Kolom Kiri: Dropdown Blok Lahan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between min-h-[24px]">
                <label
                  htmlFor="select-blok-lahan"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Penempatan Blok Lahan <span className="text-xs font-normal text-slate-500">(Opsional)</span>
                </label>
              </div>
              <div className="relative">
                <select
                  id="select-blok-lahan"
                  value={selectedBlockId}
                  onChange={(e) => {
                    setSelectedBlockId(e.target.value)
                    if (error) setError(null)
                  }}
                  className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 cursor-pointer pr-10"
                >
                  <option value="">-- Pilih Blok Lahan (Opsional) --</option>
                  {farms.map((farm) => (
                    <optgroup key={farm.id} label={farm.name}>
                      {(farm.blocks || []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <Layers className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Kolom Kanan: Dropdown Gateway IoT & Tombol Tambah Cepat */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between min-h-[24px]">
                <label
                  htmlFor="select-gateway-iot"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Gateway IoT <span className="text-xs font-normal text-slate-500">(Opsional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickGatewayOpen(true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Gateway Baru</span>
                </button>
              </div>
              <div className="relative">
                <select
                  id="select-gateway-iot"
                  value={selectedGatewayId}
                  onChange={(e) => setSelectedGatewayId(e.target.value)}
                  disabled={isLoadingGateways}
                  className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed cursor-pointer pr-10"
                >
                  <option value="">-- Pilih Gateway (Opsional) --</option>
                  {isLoadingGateways ? (
                    <option value="">Memuat daftar gateway...</option>
                  ) : gateways.length === 0 ? (
                    <option value="">-- Belum ada gateway terdaftar (Opsional) --</option>
                  ) : (
                    gateways.map((gtw) => {
                      const gtwId = gtw.id_gateway || gtw.id || ''
                      return (
                        <option key={gtwId} value={gtwId}>
                          {gtw.kode_perangkat} ({gtw.status_koneksi || 'belum_terhubung'})
                        </option>
                      )
                    })
                  )}
                </select>
                <Network className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Baris Tipe Sensor & Status Koneksi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Tipe Sensor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between min-h-[24px]">
                <label
                  htmlFor="select-tipe-sensor"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Tipe Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
                </label>
              </div>
              <div className="relative">
                <select
                  id="select-tipe-sensor"
                  value={tipeSensor}
                  onChange={(e) => setTipeSensor(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 cursor-pointer pr-10"
                >
                  <option value="lux_suhu">Sensor Cahaya & Suhu (lux_suhu) - Default</option>
                  <option value="cahaya">Sensor Cahaya (Lux)</option>
                  <option value="suhu">Sensor Suhu Lingkungan</option>
                  <option value="kelembapan">Sensor Kelembapan</option>
                </select>
                <Cpu className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status Koneksi Awal */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between min-h-[24px]">
                <label className="block text-sm font-semibold text-slate-800">
                  Status Koneksi Awal <span className="text-rose-600 font-bold ml-0.5">*</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(['aktif', 'nonaktif'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusKoneksi(st)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 capitalize ${
                      statusKoneksi === st
                        ? st === 'aktif'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs ring-1 ring-emerald-600/30'
                          : 'border-rose-400 bg-rose-50 text-rose-800 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        st === 'aktif' ? 'bg-emerald-600' : 'bg-rose-500'
                      }`}
                    />
                    {st === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              Simpan Node
            </Button>
          </div>
        </form>
      </Modal>

      {/* Popup Cepat Tambah Gateway */}
      <QuickAddGatewayModal
        isOpen={isQuickGatewayOpen}
        availableBlocks={availableBlocks}
        defaultBlockId={selectedBlockId}
        onClose={() => setIsQuickGatewayOpen(false)}
        onSuccess={handleQuickGatewaySuccess}
      />
    </>
  )
}
