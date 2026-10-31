import { useState, useEffect, useMemo, useCallback, type FC, type FormEvent } from 'react'
import {
  Radio,
  Plus,
  Check,
  Copy,
  Layers,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { gatewayService } from '@/services/gatewayService'
import { nodeService } from '@/services/nodeService'
import { sensorKeys, blockKeys, farmKeys } from '@/services/queryKeys'
import { useSaasMode } from '@/context/SaasContext'
import type { FarmItem } from '@/types/farm.types'
import type { GatewayBackend } from '@/types/gateway.types'
import type { CreateNodePayload } from '@/types/node.types'
import type { SensorNodeItem } from '@/types/sensor.types'
import { containsMaliciousScript, XSS_ERROR_MESSAGE } from '@/utils/sanitize'
import { nodeSensorSchema } from '@/schemas/nodeSensor.schema'

interface AddSensorModalProps {
  isOpen: boolean
  isSubmitting: boolean
  farms?: FarmItem[]
  sensors?: SensorNodeItem[]
  onClose: () => void
  onSubmit: (payload: CreateNodePayload) => Promise<unknown>
}

export const AddSensorModal: FC<AddSensorModalProps> = ({
  isOpen,
  isSubmitting,
  farms: externalFarms,
  sensors: externalSensors,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null

  return (
    <AddSensorModalContent
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      initialFarms={externalFarms}
      initialSensors={externalSensors}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

interface AddSensorModalContentProps {
  isOpen: boolean
  isSubmitting: boolean
  initialFarms?: FarmItem[]
  initialSensors?: SensorNodeItem[]
  onClose: () => void
  onSubmit: (payload: CreateNodePayload) => Promise<unknown>
}

interface SensorSuccessData {
  nodeCode: string
  blockName: string
  farmName: string
  gatewayCode: string
  pairingCode: string
  qrCodeText: string
}

const formatGatewayStatus = (status?: string | null): string => {
  if (!status) return 'Belum Terhubung'
  const lower = status.toLowerCase()
  if (lower === 'aktif' || lower === 'online') return 'Terhubung'
  if (lower === 'belum_terhubung') return 'Belum Terhubung'
  if (lower === 'offline') return 'Offline'
  return status.replace(/_/g, ' ')
}

const AddSensorModalContent: FC<AddSensorModalContentProps> = ({
  isOpen,
  isSubmitting: externalSubmitting,
  initialFarms,
  initialSensors,
  onClose,
  onSubmit,
}) => {
  const { isSaasEnabled } = useSaasMode()
  const queryClient = useQueryClient()
  const [farms, setFarms] = useState<FarmItem[]>(initialFarms || [])
  const [gateways, setGateways] = useState<GatewayBackend[]>([])
  const [isLoadingGateways, setIsLoadingGateways] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string>('')
  const [gatewayMode, setGatewayMode] = useState<'auto' | 'existing'>('auto')
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('')
  const [cachedAutoGateway, setCachedAutoGateway] = useState<{
    blockId: string
    gateway: GatewayBackend
  } | null>(null)
  const [kodePerangkat, setKodePerangkat] = useState<string>('')
  const [tipeSensor, setTipeSensor] = useState<string>('cahaya_lux')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubscriptionError, setIsSubscriptionError] = useState(false)
  const [successData, setSuccessData] = useState<SensorSuccessData | null>(null)
  const [copied, setCopied] = useState(false)

  // Mapping ID blok ke kode node perangkat yang sudah aktif (Validasi 1 Blok = 1 Sensor)
  const assignedBlockMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const s of initialSensors || []) {
      if (s.blockId) {
        const bId = String(s.blockId).trim()
        map[bId] = s.nodeCode || 'Aktif'
      }
    }
    return map
  }, [initialSensors])

  // Sinkronisasi data kebun & blok saat modal dibuka
  useEffect(() => {
    if (initialFarms && initialFarms.length > 0) {
      setFarms(initialFarms)
    }
  }, [initialFarms])

  // Fetch gateway dari backend berdasarkan blok terpilih
  const loadGatewaysForBlock = useCallback(
    async (blockId: string) => {
      const trimmedId = blockId.trim()
      if (!trimmedId) {
        setGateways([])
        setIsLoadingGateways(false)
        setSelectedGatewayId('')
        return
      }

      setIsLoadingGateways(true)
      try {
        const currentFarms = farms
        let resolvedFarmId: string | undefined
        for (const f of currentFarms || []) {
          const farmId = ((f as unknown as { id_kebun?: string }).id_kebun ?? f.id) as string | undefined
          const matchedBlock = (f.blocks || []).find((b) => {
            const bId = ((b as unknown as { id_blok?: string }).id_blok ?? b.id) as string | undefined
            return String(bId) === String(trimmedId)
          })
          if (matchedBlock) {
            resolvedFarmId =
              (matchedBlock as unknown as { kebun_id?: string; farmId?: string }).kebun_id ??
              (matchedBlock as unknown as { kebun_id?: string; farmId?: string }).farmId ??
              farmId
            break
          }
        }

        const data = await gatewayService.getByBlockId(trimmedId, resolvedFarmId)
        setGateways(data || [])
      } catch {
        setGateways([])
      } finally {
        setIsLoadingGateways(false)
      }
    },
    [farms]
  )

  useEffect(() => {
    loadGatewaysForBlock(selectedBlockId)
  }, [selectedBlockId, loadGatewaysForBlock])

  // Filter ketat gateway di frontend: blok_id gateway harus sama dengan selectedBlockId
  const filteredGateways = useMemo(() => {
    if (!selectedBlockId) return []
    return gateways.filter((gw) => {
      const gwBlokId =
        gw.blok_id ??
        (gw as unknown as { blockId?: string }).blockId ??
        (gw as unknown as { blok?: { id_blok?: string; id?: string } }).blok?.id_blok ??
        (gw as unknown as { blok?: { id_blok?: string; id?: string } }).blok?.id
      return String(gwBlokId) === String(selectedBlockId)
    })
  }, [gateways, selectedBlockId])

  // Sinkronisasi mode gateway ketika filteredGateways berubah
  useEffect(() => {
    if (filteredGateways.length > 0) {
      if (!selectedGatewayId || !filteredGateways.some((g) => (g.id_gateway || g.id) === selectedGatewayId)) {
        setSelectedGatewayId(filteredGateways[0]?.id_gateway || filteredGateways[0]?.id || '')
      }
    } else {
      setGatewayMode('auto')
      setSelectedGatewayId('')
    }
  }, [filteredGateways, selectedGatewayId])

  // Helper untuk mengecek apakah suatu blok sudah memiliki sensor aktif
  const getAssignedNodeCode = useCallback(
    (blockId: string, blockData?: { nodeSensor?: string; node_sensor?: unknown; sensor?: unknown }) => {
      if (assignedBlockMap[blockId]) return assignedBlockMap[blockId]
      if (blockData) {
        if (
          blockData.nodeSensor &&
          blockData.nodeSensor !== 'Belum Terpasang' &&
          blockData.nodeSensor !== '-' &&
          blockData.nodeSensor.trim() !== ''
        ) {
          return blockData.nodeSensor
        }
      }
      return null
    },
    [assignedBlockMap]
  )

  // Salin kode pairing ke clipboard
  const handleCopyPairingCode = async () => {
    if (!successData?.pairingCode) return
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(successData.pairingCode)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = successData.pairingCode
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

  // Submit form terpadu: siapkan gateway jika auto, lalu buat node sensor secara atomik
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubscriptionError(false)
    setError(null)

    if (containsMaliciousScript(kodePerangkat) || containsMaliciousScript(tipeSensor)) {
      setError(XSS_ERROR_MESSAGE)
      return
    }

    if (!selectedBlockId.trim()) {
      setError('Penempatan Blok Lahan wajib dipilih.')
      return
    }

    const assignedNode = getAssignedNodeCode(selectedBlockId)
    if (assignedNode) {
      setError(`Blok lahan ini sudah memiliki node sensor aktif (${assignedNode}). Satu blok hanya dapat dipasangkan dengan satu node sensor.`)
      return
    }

    if (!kodePerangkat.trim()) {
      setError('Kode Perangkat Node Sensor wajib diisi.')
      return
    }

    setIsSubmitting(true)

    try {
      let resolvedGatewayId = ''
      let resolvedGatewayCode = ''
      let resolvedPairingCode = ''

      if (gatewayMode === 'existing') {
        if (!selectedGatewayId.trim()) {
          setError('Pilih Gateway IoT yang tersedia di blok ini, atau gunakan mode buat baru otomatis.')
          setIsSubmitting(false)
          return
        }
        const existingGw = filteredGateways.find(
          (g) => (g.id_gateway || g.id) === selectedGatewayId.trim()
        )
        resolvedGatewayId = selectedGatewayId.trim()
        resolvedGatewayCode = existingGw?.kode_perangkat || 'GTW-IoT'
        resolvedPairingCode = existingGw?.kode_pairing || ''
      } else {
        // Mode 'auto': gunakan gateway sementara jika sudah pernah dibuat untuk blok ini (saat retry)
        if (cachedAutoGateway && cachedAutoGateway.blockId === selectedBlockId.trim()) {
          resolvedGatewayId = cachedAutoGateway.gateway.id_gateway || cachedAutoGateway.gateway.id || ''
          resolvedGatewayCode = cachedAutoGateway.gateway.kode_perangkat
          resolvedPairingCode = cachedAutoGateway.gateway.kode_pairing || ''
        } else {
          // Buat gateway baru secara otomatis dengan kode unik deterministik
          const cleanNode = kodePerangkat.trim().replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase()
          let candidateCode = `GTW-${cleanNode}`

          const codeExists = gateways.some(
            (g) => g.kode_perangkat.toLowerCase() === candidateCode.toLowerCase()
          )
          if (codeExists) {
            candidateCode = `${candidateCode}-${Date.now().toString().slice(-4)}`
          }

          let createdGw: GatewayBackend | null = null
          try {
            const gwRes = await gatewayService.create({
              blok_id: selectedBlockId.trim(),
              kode_perangkat: candidateCode,
              status_koneksi: 'belum_terhubung',
            })
            const resObj = gwRes as unknown as Record<string, unknown>
            const resData = (resObj?.data as Record<string, unknown>)?.data || resObj?.data || resObj
            const resDataTyped = resData as Record<string, unknown>
            createdGw = {
              id_gateway: String(resDataTyped?.id_gateway || resDataTyped?.id || `gtw-${Date.now()}`),
              blok_id: selectedBlockId.trim(),
              kode_perangkat: String(resDataTyped?.kode_perangkat || candidateCode),
              status_koneksi: String(resDataTyped?.status_koneksi || 'belum_terhubung'),
              kode_pairing: String(resDataTyped?.kode_pairing || ''),
            }
          } catch (gwErr: unknown) {
            const errObj = gwErr as Record<string, unknown>
            const status = (errObj?.status || (errObj?.response as Record<string, unknown>)?.status) as number
            if (status === 422) {
              const retryCode = `${candidateCode}-${Date.now().toString().slice(-4)}`
              const retryRes = await gatewayService.create({
                blok_id: selectedBlockId.trim(),
                kode_perangkat: retryCode,
                status_koneksi: 'belum_terhubung',
              })
              const retryObj = retryRes as unknown as Record<string, unknown>
              const retryData = (retryObj?.data as Record<string, unknown>)?.data || retryObj?.data || retryObj
              const retryDataTyped = retryData as Record<string, unknown>
              createdGw = {
                id_gateway: String(retryDataTyped?.id_gateway || retryDataTyped?.id || `gtw-${Date.now()}`),
                blok_id: selectedBlockId.trim(),
                kode_perangkat: String(retryDataTyped?.kode_perangkat || retryCode),
                status_koneksi: String(retryDataTyped?.status_koneksi || 'belum_terhubung'),
                kode_pairing: String(retryDataTyped?.kode_pairing || ''),
              }
            } else {
              throw gwErr
            }
          }

          if (createdGw) {
            setCachedAutoGateway({ blockId: selectedBlockId.trim(), gateway: createdGw })
            resolvedGatewayId = createdGw.id_gateway
            resolvedGatewayCode = createdGw.kode_perangkat
            resolvedPairingCode = createdGw.kode_pairing || ''
          }
        }
      }

      if (!resolvedGatewayId) {
        setError('Gagal menyiapkan Gateway IoT untuk blok ini.')
        setIsSubmitting(false)
        return
      }

      // Validasi skema Zod untuk Node Sensor
      const validation = nodeSensorSchema.safeParse({
        kode_perangkat: kodePerangkat.trim(),
        blok_id: selectedBlockId.trim(),
        gateway_id: resolvedGatewayId,
        tipe_sensor: tipeSensor.trim(),
        status_koneksi: 'aktif',
      })

      if (!validation.success) {
        const firstIssue = validation.error.issues[0]
        let msg = firstIssue.message
        if (firstIssue.path.includes('kode_perangkat')) {
          msg = 'Kode Perangkat: ' + firstIssue.message
        }
        setError(msg)
        setIsSubmitting(false)
        return
      }

      // Panggil onSubmit untuk pembuatan Node Sensor di backend
      const payload: CreateNodePayload = {
        kode_perangkat: kodePerangkat.trim(),
        blok_id: selectedBlockId.trim(),
        gateway_id: resolvedGatewayId,
        tipe_sensor: tipeSensor.trim(),
        status_koneksi: 'offline',
      }

      const res = await onSubmit(payload)

      // Dapatkan data QR dari respons atau nodeService
      const resObj = res as Record<string, unknown>
      const possibleData =
        (resObj?.data as Record<string, unknown>)?.data || resObj?.data || resObj
      const sensorId =
        (possibleData as Record<string, unknown>)?.id_sensor ||
        (possibleData as Record<string, unknown>)?.id

      let qrText = ''
      if (sensorId && typeof sensorId === 'string') {
        try {
          const freshNode = await nodeService.getById(sensorId)
          if (freshNode) {
            qrText =
              freshNode.qr?.teks_kode_qr ||
              (freshNode as unknown as { qr_code?: string }).qr_code ||
              ''
          }
        } catch {
          // fallback
        }
      }

      if (!qrText) {
        qrText =
          ((possibleData as Record<string, unknown>)?.qr as Record<string, unknown>)
            ?.teks_kode_qr as string ||
          ((possibleData as Record<string, unknown>)?.qr_code as string) ||
          `QR-${kodePerangkat.trim()}`
      }

      const foundFarm = farms.find(
        (f) => f.id === selectedBlockId || (f.blocks || []).some((b) => b.id === selectedBlockId)
      )
      const foundBlock = foundFarm?.blocks?.find((b) => b.id === selectedBlockId)

      setSuccessData({
        nodeCode: kodePerangkat.trim(),
        blockName: foundBlock?.name || 'Blok Lahan',
        farmName: foundFarm?.name || 'Kebun',
        gatewayCode: resolvedGatewayCode,
        pairingCode: resolvedPairingCode,
        qrCodeText: qrText,
      })
      setCachedAutoGateway(null)
      setError(null)
    } catch (err: unknown) {
      let msg = 'Gagal menambahkan node sensor baru.'
      if (err && typeof err === 'object') {
        const errObj = err as Record<string, unknown>
        const status = (errObj.status || (errObj.response as Record<string, unknown>)?.status) as number
        const responseData = (errObj.response as Record<string, unknown>)?.data as Record<string, unknown>
        const errors = (responseData?.errors || errObj.errors) as Record<string, string[]> | undefined

        if (status === 422) {
          if (errors?.blok_id) {
            msg = 'Blok lahan ini sudah memiliki node sensor aktif. Satu blok hanya dapat dipasangkan dengan satu node.'
          } else if (errors?.kode_perangkat) {
            msg = 'Kode perangkat node ini sudah digunakan. Mohon gunakan kode perangkat lain yang unik.'
          } else if (errors?.gateway_id) {
            msg = 'Gateway IoT yang dipilih tidak valid untuk blok ini.'
          } else if (responseData?.message) {
            msg = String(responseData.message)
          }
        } else if (status === 403) {
          msg = isSaasEnabled
            ? 'Batas kuota perangkat sensor pada paket langganan Anda telah tercapai.'
            : 'Anda tidak memiliki hak akses untuk menambahkan perangkat sensor pada blok ini.'
          if (isSaasEnabled) {
            setIsSubscriptionError(true)
          }
        } else if (status === 404) {
          msg = 'Blok atau Gateway tidak ditemukan di server.'
        } else if (errObj.message) {
          msg = String(errObj.message)
        }
      }
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Selesaikan proses: invalidasi query TanStack dan tutup modal
  const handleFinish = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: sensorKeys.all, refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['nodes'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
    ])
    setSuccessData(null)
    setCachedAutoGateway(null)
    setKodePerangkat('')
    setError(null)
    onClose()
  }

  const isBusy = isSubmitting || externalSubmitting

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={successData ? handleFinish : onClose}
        title={successData ? 'Node Sensor & Gateway Berhasil Dibuat' : 'Tambah Node Sensor Baru'}
        description={
          successData
            ? 'Perangkat IoT telah terdaftar di sistem. Lakukan pairing ESP32 untuk menghubungkan node ke jaringan.'
            : 'Daftarkan perangkat node IoT baru untuk memantau intensitas cahaya lux dan kondisi lingkungan blok lahan.'
        }
        maxWidth="lg"
      >
        {successData ? (
          /* TAMPILAN SUKSES TERPADU (Single Container, Zero Stacked Modal) */
          <div className="space-y-4 pt-1 text-left">
            {/* Ringkasan Perangkat */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Perangkat Node:</span>
                <span className="font-mono font-bold text-slate-900">{successData.nodeCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Blok Lahan:</span>
                <span className="font-semibold text-slate-800">
                  {successData.blockName} ({successData.farmName})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Gateway Terhubung:</span>
                <span className="font-mono font-semibold text-slate-800">{successData.gatewayCode}</span>
              </div>
            </div>

            {/* Kotak Kode Pairing ESP32 */}
            {successData.pairingCode ? (
              <div className="bg-slate-50 border-2 border-slate-900 rounded-lg p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-slate-700 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kode Pairing ESP32
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 tracking-wider select-all truncate">
                    {successData.pairingCode}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPairingCode}
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

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-100 border border-slate-200 rounded-lg p-3">
                  Masukkan kode ini pada halaman konfigurasi WiFi ESP32. Kode hanya berlaku satu kali dan otomatis hangus setelah gateway terhubung.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3.5 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  Node terhubung ke Gateway aktif ({successData.gatewayCode}). Gateway ini telah dipasangkan sebelumnya dan siap meneruskan telemetri ke server.
                </p>
              </div>
            )}

            {/* Tombol Selesai */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleFinish}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-8 rounded-lg cursor-pointer"
              >
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          /* TAMPILAN FORM TERPADU */
          <form onSubmit={handleSubmit} className="space-y-5 pt-1 text-left">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold space-y-1">
                <p>{error}</p>
                {isSubscriptionError && isSaasEnabled && (
                  <div className="pt-1">
                    <Link
                      to="/kebun/langganan"
                      className="inline-flex items-center text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
                    >
                      Buka Halaman Langganan
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* LANGKAH 1: PILIH BLOK LAHAN (1 Blok = 1 Sensor) */}
            <div className="space-y-1.5">
              <label
                htmlFor="select-blok-lahan"
                className="block text-xs font-semibold text-slate-800"
              >
                Langkah 1: Penempatan Blok Lahan <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
                <select
                  id="select-blok-lahan"
                  value={selectedBlockId}
                  onChange={(e) => {
                    setSelectedBlockId(e.target.value)
                    if (error) setError(null)
                  }}
                  required
                  className="block w-full appearance-none rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="">Pilih Blok Lahan</option>
                  {farms.map((farm) => (
                    <optgroup key={farm.id} label={farm.name}>
                      {(farm.blocks || []).map((b) => {
                        const assignedNode = getAssignedNodeCode(b.id, b)
                        const isAssigned = Boolean(assignedNode)
                        const bName = b.name.trim()
                        const formattedBlockName = bName.toLowerCase().startsWith('blok') ? bName : `Blok ${bName}`
                        return (
                          <option
                            key={b.id}
                            value={b.id}
                            disabled={isAssigned}
                            className={isAssigned ? 'text-slate-400 bg-slate-50 italic' : ''}
                          >
                            {farm.name} - {formattedBlockName} {isAssigned ? `(Sudah memiliki Node: ${assignedNode})` : ''}
                          </option>
                        )
                      })}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500">
                Satu blok lahan hanya dapat dipasangkan dengan satu unit node sensor.
              </p>
            </div>

            {/* LANGKAH 2: KODE PERANGKAT NODE */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-kode-perangkat"
                className="block text-xs font-semibold text-slate-800"
              >
                Langkah 2: Kode Perangkat Node Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Radio className="w-4 h-4" />
                </div>
                <input
                  id="input-kode-perangkat"
                  name="kodePerangkat"
                  type="text"
                  value={kodePerangkat}
                  onChange={(e) => {
                    setKodePerangkat(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Contoh: ND-BLOKA-01"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Kode unik penanda perangkat di lapangan. Stiker QR resmi akan dibuat otomatis saat disimpan.
              </p>
            </div>

            {/* LANGKAH 3: TIPE SENSOR */}
            <div className="space-y-1.5">
              <label
                htmlFor="select-tipe-sensor"
                className="block text-xs font-semibold text-slate-800"
              >
                Langkah 3: Tipe Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-tipe-sensor"
                  name="tipe_sensor"
                  value={tipeSensor}
                  onChange={(e) => setTipeSensor(e.target.value)}
                  required
                  className="block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer pr-10"
                >
                  <option value="cahaya_lux">Sensor Intensitas Cahaya (Lux)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* LANGKAH 4: KONFIGURASI GATEWAY IOT TERPADU */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-800">
                Langkah 4: Konfigurasi Gateway IoT Blok
              </label>

              {/* Kasus A: Belum ada gateway di blok ini */}
              {!selectedBlockId ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                  Pilih Blok Lahan pada langkah 1 untuk memeriksa ketersediaan Gateway.
                </div>
              ) : isLoadingGateways ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
                  Memeriksa gateway blok...
                </div>
              ) : filteredGateways.length === 0 ? (
                <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
                  <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
                    <Wifi className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Pembuatan Gateway Otomatis</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Blok ini belum memiliki Gateway. Gateway IoT dan Kode Pairing ESP32 akan dibuat otomatis saat Anda menekan tombol Simpan Node.
                  </p>
                </div>
              ) : (
                /* Kasus B: Blok sudah memiliki gateway (berikan opsi pilih atau buat baru) */
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-colors flex items-start gap-2.5 ${
                        gatewayMode === 'existing'
                          ? 'border-emerald-600 bg-emerald-50/40 text-slate-900'
                          : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gatewayMode"
                        value="existing"
                        checked={gatewayMode === 'existing'}
                        onChange={() => setGatewayMode('existing')}
                        className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                      />
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold block">Gunakan Gateway Tersedia</span>
                        <span className="text-slate-500 text-[11px] block">
                          Hubungkan node ke gateway yang sudah terdaftar di blok ini.
                        </span>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-colors flex items-start gap-2.5 ${
                        gatewayMode === 'auto'
                          ? 'border-emerald-600 bg-emerald-50/40 text-slate-900'
                          : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gatewayMode"
                        value="auto"
                        checked={gatewayMode === 'auto'}
                        onChange={() => setGatewayMode('auto')}
                        className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                      />
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold block">Buat Gateway Baru Otomatis</span>
                        <span className="text-slate-500 text-[11px] block">
                          Generate gateway tambahan beserta kode pairing baru.
                        </span>
                      </div>
                    </label>
                  </div>

                  {gatewayMode === 'existing' && (
                    <div className="space-y-1 pt-1">
                      <label htmlFor="select-existing-gateway" className="block text-[11px] font-semibold text-slate-700">
                        Pilih Gateway di Blok Ini:
                      </label>
                      <select
                        id="select-existing-gateway"
                        value={selectedGatewayId}
                        onChange={(e) => setSelectedGatewayId(e.target.value)}
                        required
                        className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                      >
                        {filteredGateways.map((gw) => {
                          const gwId = gw.id_gateway || gw.id || ''
                          return (
                            <option key={gwId} value={gwId}>
                              {gw.kode_perangkat} ({formatGatewayStatus(gw.status_koneksi)})
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onClose}
                disabled={isBusy}
                className="cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isBusy || !selectedBlockId.trim() || !kodePerangkat.trim()}
                isLoading={isBusy}
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-xs"
              >
                Simpan Node
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
