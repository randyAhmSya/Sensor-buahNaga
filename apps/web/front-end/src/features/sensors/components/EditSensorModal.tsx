import { useState, useEffect, useMemo, useRef, type FC, type FormEvent } from 'react'
import { Radio, Cpu, CheckCircle2, Layers, Network, Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/form/InputField'
import { farmService } from '@/services/farmService'
import { gatewayService } from '@/services/gatewayService'
import type { FarmItem } from '@/types/farm.types'
import type { GatewayBackend } from '@/types/gateway.types'
import type { SensorNodeItem, SensorStatus } from '@/types/sensor.types'
import { QuickAddGatewayModal, type QuickBlockOption } from './QuickAddGatewayModal'
import { containsMaliciousScript, XSS_ERROR_MESSAGE } from '@/utils/sanitize'

export interface EditSensorFormData {
  nodeCode: string
  blockId?: string | null
  gatewayId?: string | null
  tipeSensor: string
  status: SensorStatus
}

interface EditSensorModalProps {
  isOpen: boolean
  sensor: SensorNodeItem | null
  isSubmitting: boolean
  farms?: FarmItem[]
  onClose: () => void
  onSubmit: (sensorId: string, data: EditSensorFormData) => Promise<void>
}

interface EditSensorFormContentProps {
  sensor: SensorNodeItem
  isSubmitting: boolean
  initialFarms?: FarmItem[]
  onClose: () => void
  onSubmit: (sensorId: string, data: EditSensorFormData) => Promise<void>
}

const EditSensorFormContent: FC<EditSensorFormContentProps> = ({
  sensor,
  isSubmitting,
  initialFarms,
  onClose,
  onSubmit,
}) => {
  const [farms, setFarms] = useState<FarmItem[]>(initialFarms || [])
  const [gateways, setGateways] = useState<GatewayBackend[]>([])
  const [isLoadingGateways, setIsLoadingGateways] = useState(false)
  const [formData, setFormData] = useState<EditSensorFormData>({
    nodeCode: sensor.nodeCode,
    blockId: sensor.blockId || null,
    gatewayId: sensor.gatewayId || null,
    status: sensor.status,
    tipeSensor: sensor.tipeSensor || 'cahaya',
  })
  const [isQuickGatewayOpen, setIsQuickGatewayOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<string | null>(null)

  const hasFetchedFarmsRef = useRef(false)

  // 1. Muat data kebun jika belum disediakan dari props
  useEffect(() => {
    if (initialFarms && initialFarms.length > 0) {
      setFarms(initialFarms)
      return
    }

    if (!hasFetchedFarmsRef.current) {
      hasFetchedFarmsRef.current = true
      farmService
        .getAll()
        .then((data) => setFarms(data || []))
        .catch(() => setFarms([]))
    }
  }, [initialFarms])

  // 2. Fetch gateway HANYA jika blockId terisi (Mencegah HTTP 400 Bad Request)
  useEffect(() => {
    if (!formData.blockId || !formData.blockId.trim()) {
      setGateways([])
      setFormData((prev) => ({ ...prev, gatewayId: null }))
      setIsLoadingGateways(false)
      return
    }

    let isMounted = true
    setIsLoadingGateways(true)

    gatewayService
      .getByBlockId(formData.blockId.trim())
      .then((data) => {
        if (!isMounted) return
        setGateways(data || [])
        // Pastikan gatewayId yang terpilih masih valid dalam daftar blok
        setFormData((prev) => {
          if (data && prev.gatewayId && data.some((g) => (g.id_gateway || g.id) === prev.gatewayId)) {
            return prev
          }
          return { ...prev, gatewayId: prev.gatewayId || null }
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
  }, [formData.blockId])

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
    setGateways((prev) => [newGateway, ...prev.filter((g) => (g.id_gateway || g.id) !== newGtwId)])
    setFormData((prev) => ({
      ...prev,
      gatewayId: newGtwId,
      blockId: prev.blockId || newGateway.blok_id || null,
    }))
    setSuccessInfo(`Gateway "${newGateway.kode_perangkat}" berhasil ditambahkan dan dipilih.`)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.nodeCode.trim()) {
      setError('Kode node perangkat wajib diisi.')
      return
    }

    if (containsMaliciousScript(formData.nodeCode) || containsMaliciousScript(formData.tipeSensor)) {
      setError(XSS_ERROR_MESSAGE)
      return
    }

    try {
      await onSubmit(sensor.id, formData)
      onClose()
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Gagal memperbarui data sensor.')
    }
  }

  return (
    <>
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

        {/* Informasi Penempatan Ringkas */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Penempatan Lahan</p>
            <p className="font-bold text-slate-800 mt-0.5">{sensor.farmName} • {sensor.blockName}</p>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            ID: {sensor.id.slice(0, 8)}...
          </span>
        </div>

        {/* Kode Perangkat */}
        <InputField
          label="Kode Perangkat Node"
          name="nodeCode"
          value={formData.nodeCode}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, nodeCode: e.target.value }))
            if (error) setError(null)
          }}
          placeholder="Contoh: SNS-BLOK-A-01"
          leftIcon={<Radio className="w-4 h-4 text-slate-400" />}
          required
        />

        {/* Baris Pilihan Blok & Gateway (Layout Simetris & Terkoordinasi) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {/* Dropdown Blok */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between min-h-[24px]">
              <label htmlFor="edit-select-blok" className="block text-sm font-semibold text-slate-800">
                Penempatan Blok Lahan <span className="text-xs font-normal text-slate-500">(Opsional)</span>
              </label>
            </div>
            <div className="relative">
              <select
                id="edit-select-blok"
                value={formData.blockId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, blockId: e.target.value || null }))}
                className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 cursor-pointer pr-10"
              >
                <option value="">-- Pilih Blok (Opsional) --</option>
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

          {/* Dropdown Gateway IoT & Tombol Tambah Cepat */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between min-h-[24px]">
              <label htmlFor="edit-select-gateway" className="block text-sm font-semibold text-slate-800">
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
                id="edit-select-gateway"
                value={formData.gatewayId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, gatewayId: e.target.value || null }))}
                disabled={!formData.blockId || isLoadingGateways}
                className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed cursor-pointer pr-10"
              >
                {!formData.blockId ? (
                  <option value="">-- Pilih Blok terlebih dahulu --</option>
                ) : isLoadingGateways ? (
                  <option value="">Memuat daftar gateway blok...</option>
                ) : gateways.length === 0 ? (
                  <option value="">-- Belum ada gateway di blok ini (Opsional) --</option>
                ) : (
                  <>
                    <option value="">-- Pilih Gateway (Opsional) --</option>
                    {gateways.map((gtw) => {
                      const gtwId = gtw.id_gateway || gtw.id || ''
                      return (
                        <option key={gtwId} value={gtwId}>
                          {gtw.kode_perangkat} ({gtw.status_koneksi || 'offline'})
                        </option>
                      )
                    })}
                  </>
                )}
              </select>
              <Network className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tipe Sensor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between min-h-[24px]">
            <label htmlFor="edit-select-tipe" className="block text-sm font-semibold text-slate-800">
              Tipe Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
            </label>
          </div>
          <div className="relative">
            <select
              id="edit-select-tipe"
              value={formData.tipeSensor}
              onChange={(e) => setFormData((prev) => ({ ...prev, tipeSensor: e.target.value }))}
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

        {/* Status Koneksi */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            Status Koneksi Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, status: 'Aktif' }))}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                formData.status === 'Aktif' || formData.status === 'Online'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs ring-1 ring-emerald-600/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Aktif</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, status: 'Nonaktif' }))}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                formData.status === 'Nonaktif' || formData.status === 'Offline'
                  ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-2xs ring-1 ring-rose-500/30'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Nonaktif</span>
            </button>
          </div>
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
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-xs"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>

      {/* Popup Cepat Tambah Gateway */}
      <QuickAddGatewayModal
        isOpen={isQuickGatewayOpen}
        availableBlocks={availableBlocks}
        defaultBlockId={formData.blockId || undefined}
        onClose={() => setIsQuickGatewayOpen(false)}
        onSuccess={handleQuickGatewaySuccess}
      />
    </>
  )
}

export const EditSensorModal: FC<EditSensorModalProps> = ({
  isOpen,
  sensor,
  isSubmitting,
  farms,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !sensor) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Node Sensor"
      description={`Konfigurasi data identifikasi, penempatan, dan gateway perangkat ${sensor.nodeCode}`}
      maxWidth="lg"
    >
      <EditSensorFormContent
        key={sensor.id}
        sensor={sensor}
        isSubmitting={isSubmitting}
        initialFarms={farms}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
