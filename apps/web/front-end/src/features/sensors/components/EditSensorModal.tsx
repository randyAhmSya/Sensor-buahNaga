import { useState, useEffect, type FC, type FormEvent } from 'react'
import { Radio, CheckCircle2, QrCode, RefreshCw } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/form/InputField'
import { gatewayService } from '@/services/gatewayService'
import { nodeService } from '@/services/nodeService'
import { farmService } from '@/services/farmService'
import type { GatewayBackend } from '@/types/gateway.types'
import type { SensorNodeItem, SensorStatus } from '@/types/sensor.types'
import { containsMaliciousScript, XSS_ERROR_MESSAGE } from '@/utils/sanitize'

export interface EditSensorFormData {
  nodeCode: string
  gatewayId?: string | null
  tipeSensor: string
  status: SensorStatus
}

interface EditSensorModalProps {
  isOpen: boolean
  sensor: SensorNodeItem | null
  isSubmitting: boolean
  farms?: unknown[]
  onClose: () => void
  onSubmit: (sensorId: string, data: EditSensorFormData) => Promise<void>
}

interface EditSensorFormContentProps {
  sensor: SensorNodeItem
  farms?: unknown[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (sensorId: string, data: EditSensorFormData) => Promise<void>
}

const EditSensorFormContent: FC<EditSensorFormContentProps> = ({
  sensor,
  farms,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [gateways, setGateways] = useState<GatewayBackend[]>([])
  const [isLoadingGateways, setIsLoadingGateways] = useState(false)
  const [formData, setFormData] = useState<EditSensorFormData>({
    nodeCode: sensor.nodeCode,
    gatewayId: sensor.gatewayId || null,
    status: sensor.status,
    tipeSensor: sensor.tipeSensor || 'cahaya',
  })
  const [qrCodeText, setQrCodeText] = useState<string>(sensor.qrCode || '')
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successInfo, setSuccessInfo] = useState<string | null>(null)

  // Fetch gateway yang terdaftar di blok sensor dengan resolusi defensif kebunId
  useEffect(() => {
    let isMounted = true

    const resolveAndFetch = async () => {
      const targetBlockId = sensor.blockId ? sensor.blockId.trim() : ''
      if (!targetBlockId) {
        if (isMounted) {
          setGateways([])
          setIsLoadingGateways(false)
        }
        return
      }

      setIsLoadingGateways(true)
      try {
        const rawSensor = sensor as unknown as {
          farmId?: string
          kebun_id?: string
          blockId?: string
          blok_id?: string
        }
        let resolvedFarmId = (rawSensor.farmId || rawSensor.kebun_id)?.trim()

        if (!resolvedFarmId && farms && Array.isArray(farms)) {
          for (const f of farms) {
            const farmObj = f as Record<string, unknown>
            const farmId = (farmObj.id_kebun ?? farmObj.id) as string | undefined
            const blocks = (farmObj.blocks ?? farmObj.bloks) as Array<Record<string, unknown>> | undefined
            if (Array.isArray(blocks)) {
              const matched = blocks.find((b) => {
                const bId = (b.id_blok ?? b.id) as string | undefined
                return String(bId) === String(targetBlockId)
              })
              if (matched) {
                resolvedFarmId = ((matched.kebun_id ?? matched.farmId) as string | undefined) ?? farmId
                break
              }
            }
          }
        }

        if (!resolvedFarmId) {
          try {
            const allFarms = await farmService.getAll()
            for (const f of allFarms || []) {
              const farmId = (f as unknown as { id_kebun?: string }).id_kebun ?? f.id
              const matched = (f.blocks || []).find((b) => {
                const bId = (b as unknown as { id_blok?: string }).id_blok ?? b.id
                return String(bId) === String(targetBlockId)
              })
              if (matched) {
                resolvedFarmId =
                  (matched as unknown as { kebun_id?: string; farmId?: string }).kebun_id ??
                  (matched as unknown as { kebun_id?: string; farmId?: string }).farmId ??
                  farmId
                break
              }
            }
          } catch {
            // fallback ignore error
          }
        }

        const data = await gatewayService.getByBlockId(targetBlockId, resolvedFarmId)
        if (isMounted) {
          setGateways(data || [])
        }
      } catch {
        if (isMounted) setGateways([])
      } finally {
        if (isMounted) setIsLoadingGateways(false)
      }
    }

    resolveAndFetch()

    return () => {
      isMounted = false
    }
  }, [sensor, farms])

  // Aksi membuat QR code baru jika stiker fisik rusak atau belum ada
  const handleGenerateNewQr = async () => {
    if (!sensor.id) return
    setIsGeneratingQr(true)
    setError(null)
    setSuccessInfo(null)
    try {
      const res = await nodeService.generateNewQr(sensor.id)
      const newQr = res.data?.qr?.teks_kode_qr || res.data?.kode_perangkat || ''
      if (newQr) {
        setQrCodeText(newQr)
        setSuccessInfo('Stiker QR baru berhasil digenerate di server.')
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Gagal membuat kode QR baru.')
    } finally {
      setIsGeneratingQr(false)
    }
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

      {/* Informasi Blok Lahan Terikat (Read-Only) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Lokasi Blok Lahan Terikat
          </p>
          <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
            Permanen
          </span>
        </div>
        <p className="text-sm font-bold text-slate-900">
          {sensor.farmName} ({sensor.blockName})
        </p>
        <p className="text-[11px] text-slate-500 leading-normal">
          Penempatan blok sensor tidak dapat dipindahkan setelah registrasi untuk menjaga konsistensi telemetri tanah dan intensitas lux.
        </p>
      </div>

      {/* Kode QR Stiker Fisik (Read-Only dengan Aksi Regenerasi) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Stiker QR Code Perangkat
          </p>
          <button
            type="button"
            onClick={handleGenerateNewQr}
            disabled={isGeneratingQr || isSubmitting}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isGeneratingQr ? 'animate-spin' : ''}`} />
            <span>Generate QR Baru</span>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs text-slate-800">
          <QrCode className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-bold">{qrCodeText || 'QR terdaftar otomatis di sistem'}</span>
        </div>
      </div>

      {/* Kode Perangkat */}
      <div>
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
      </div>

      {/* Dropdown Gateway IoT (Hanya Gateway di Blok Terkait) */}
      <div className="space-y-1.5">
        <label htmlFor="edit-select-gateway" className="block text-sm font-semibold text-slate-800">
          Gateway IoT Terhubung <span className="text-xs font-normal text-slate-500">(Opsional)</span>
        </label>
        <select
          id="edit-select-gateway"
          value={formData.gatewayId || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, gatewayId: e.target.value || null }))}
          disabled={isLoadingGateways || isSubmitting}
          className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer pr-8"
        >
          {isLoadingGateways ? (
            <option value="">Memuat daftar gateway blok...</option>
          ) : gateways.length === 0 ? (
            <option value="">(Belum ada gateway di blok ini)</option>
          ) : (
            <>
              <option value="">(Tanpa Gateway Tambahan)</option>
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
        {gateways.length === 0 && !isLoadingGateways && (
          <p className="text-[11px] text-slate-500">
            Blok ini belum memiliki Gateway. Anda dapat menambahkan Gateway di menu Kebun dan Blok jika diperlukan transmisi jarak jauh.
          </p>
        )}
      </div>

      {/* Tipe Sensor */}
      <div className="space-y-1.5">
        <label htmlFor="edit-select-tipe" className="block text-sm font-semibold text-slate-800">
          Tipe Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
        </label>
        <select
          id="edit-select-tipe"
          value={formData.tipeSensor}
          onChange={(e) => setFormData((prev) => ({ ...prev, tipeSensor: e.target.value }))}
          className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer pr-8"
        >
          <option value="lux_suhu">Sensor Cahaya & Suhu (lux_suhu)</option>
          <option value="cahaya">Sensor Cahaya (Lux)</option>
          <option value="suhu">Sensor Suhu Lingkungan</option>
          <option value="kelembapan">Sensor Kelembapan</option>
        </select>
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
      description={`Konfigurasi data identifikasi dan gateway perangkat ${sensor.nodeCode}`}
      maxWidth="lg"
    >
      <EditSensorFormContent
        key={sensor.id}
        sensor={sensor}
        farms={farms}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
