import { useState, useEffect, useMemo, useRef, useCallback, type FC, type FormEvent } from 'react'
import { Radio, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { farmService } from '@/services/farmService'
import { gatewayService } from '@/services/gatewayService'
import { sensorService } from '@/services/sensorService'
import { nodeService } from '@/services/nodeService'
import type { FarmItem } from '@/types/farm.types'
import type { GatewayBackend } from '@/types/gateway.types'
import type { CreateNodePayload } from '@/types/node.types'
import { QuickAddGatewayModal, type QuickBlockOption } from './QuickAddGatewayModal'
import { containsMaliciousScript, XSS_ERROR_MESSAGE } from '@/utils/sanitize'
import { nodeSensorSchema } from '@/schemas/nodeSensor.schema'
import { NewNodeQrSuccessModal } from './NewNodeQrSuccessModal'

interface AddSensorModalProps {
  isOpen: boolean
  isSubmitting: boolean
  farms?: FarmItem[]
  onClose: () => void
  onSubmit: (payload: CreateNodePayload) => Promise<unknown>
}

export const AddSensorModal: FC<AddSensorModalProps> = ({
  isOpen,
  isSubmitting,
  farms: externalFarms,
  onClose,
  onSubmit,
}) => {
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
  onSubmit: (payload: CreateNodePayload) => Promise<unknown>
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
  const [tipeSensor, setTipeSensor] = useState<string>('cahaya_lux')
  const [newNodeQrSuccess, setNewNodeQrSuccess] = useState<{
    nodeCode: string
    qrCodeText: string
    farmName?: string
    blockName?: string
  } | null>(null)
  const [isQuickGatewayOpen, setIsQuickGatewayOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubscriptionError, setIsSubscriptionError] = useState(false)

  // Mapping ID blok ke kode node perangkat yang sudah aktif (Validasi 1 Blok = 1 Sensor)
  const [assignedBlockMap, setAssignedBlockMap] = useState<Record<string, string>>({})

  const hasFetchedFarmsRef = useRef(false)

  // 1. Muat data kebun dan blok saat modal dibuka
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

  // Muat data sensor yang sudah aktif untuk validasi 1 Blok = 1 Sensor
  useEffect(() => {
    let isMounted = true
    sensorService
      .getAll()
      .then((sensorList) => {
        if (!isMounted) return
        const map: Record<string, string> = {}
        for (const s of sensorList || []) {
          if (s.blockId) {
            const bId = String(s.blockId).trim()
            map[bId] = s.nodeCode || 'Aktif'
          }
        }
        setAssignedBlockMap(map)
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  // 2. Fetch gateway dari backend berdasarkan blok terpilih (resolusi defensif kebun_id)
  const loadGatewaysForBlock = useCallback(async (blockId: string) => {
    const trimmedId = blockId.trim()
    if (!trimmedId) {
      setGateways([])
      setIsLoadingGateways(false)
      setSelectedGatewayId('')
      return
    }

    setIsLoadingGateways(true)
    try {
      let currentFarms = farms
      if (!currentFarms || currentFarms.length === 0) {
        try {
          const fetched = await farmService.getAll()
          if (fetched && fetched.length > 0) {
            currentFarms = fetched
            setFarms(fetched)
          }
        } catch {
          // ignore fallback fetch error
        }
      }

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
  }, [farms])

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

  // Auto-select gateway yang cocok jika ada
  useEffect(() => {
    if (filteredGateways.length > 0) {
      if (!filteredGateways.some((g) => (g.id_gateway || g.id) === selectedGatewayId)) {
        setSelectedGatewayId(filteredGateways[0]?.id_gateway || filteredGateways[0]?.id || '')
      }
    } else {
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

  // Flatten daftar semua blok untuk quick add gateway
  const availableBlocks = useMemo<QuickBlockOption[]>(() => {
    const list: QuickBlockOption[] = []
    farms.forEach((farm) => {
      (farm.blocks || []).forEach((block) => {
        list.push({
          id: block.id,
          name: block.name,
          farmName: farm.name,
        })
      })
    })
    return list
  }, [farms])

  // Callback setelah gateway baru berhasil ditambahkan via QuickAddGatewayModal
  const handleQuickGatewaySuccess = async (newGateway: GatewayBackend) => {
    const newGtwId = newGateway.id_gateway || newGateway.id || ''
    if (selectedBlockId) {
      await loadGatewaysForBlock(selectedBlockId)
      setGateways((prev) => {
        const exists = prev.some((g) => (g.id_gateway || g.id) === newGtwId)
        return exists ? prev : [newGateway, ...prev]
      })
    } else {
      setGateways((prev) => [newGateway, ...prev])
    }
    if (newGtwId) {
      setSelectedGatewayId(newGtwId)
    }
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubscriptionError(false)

    if (containsMaliciousScript(kodePerangkat) || containsMaliciousScript(tipeSensor)) {
      setError(XSS_ERROR_MESSAGE)
      return
    }

    // Validasi input wajib
    if (!selectedBlockId.trim()) {
      setError('Penempatan Blok Lahan pada langkah 1 wajib dipilih.')
      return
    }

    const assignedNode = getAssignedNodeCode(selectedBlockId)
    if (assignedNode) {
      setError(`Blok lahan ini sudah memiliki node sensor aktif (${assignedNode}). Satu blok hanya dapat dipasangkan dengan satu node sensor.`)
      return
    }

    if (!selectedGatewayId.trim()) {
      setError('Gateway IoT pada langkah 2 wajib dipilih. Jika belum tersedia, silakan buat Gateway terlebih dahulu.')
      return
    }

    if (!kodePerangkat.trim()) {
      setError('Kode Perangkat Node Sensor wajib diisi.')
      return
    }

    // Validasi skema Zod
    const validation = nodeSensorSchema.safeParse({
      kode_perangkat: kodePerangkat.trim(),
      blok_id: selectedBlockId.trim(),
      gateway_id: selectedGatewayId.trim(),
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
      return
    }

    try {
      // Payload bebas dari key qr_id, kode_pairing, token_perangkat
      const payload: CreateNodePayload = {
        kode_perangkat: kodePerangkat.trim(),
        blok_id: selectedBlockId.trim(),
        gateway_id: selectedGatewayId.trim(),
        tipe_sensor: tipeSensor.trim(),
        status_koneksi: 'offline',
      }

      const res = await onSubmit(payload)

      // Ambil id_sensor dari response untuk memuat kode QR resmi
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

      setNewNodeQrSuccess({
        nodeCode: kodePerangkat.trim(),
        qrCodeText: qrText,
        farmName: foundFarm?.name,
        blockName: foundBlock?.name,
      })
      setKodePerangkat('')
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
            msg = 'Kode perangkat ini sudah digunakan. Mohon gunakan kode perangkat lain yang unik.'
          } else if (errors?.gateway_id) {
            msg = 'Gateway IoT yang dipilih tidak valid untuk blok ini.'
          } else if (responseData?.message) {
            msg = String(responseData.message)
          } else {
            msg = 'Data formulir tidak valid. Mohon periksa kembali isian Anda.'
          }
        } else if (status === 402) {
          msg = 'Batas kuota perangkat sensor untuk paket langganan Anda telah tercapai. Silakan upgrade paket pada menu Langganan.'
          setIsSubscriptionError(true)
        } else if (status === 403) {
          msg = 'Akses ditolak: Blok atau gateway bukan milik tenant Anda.'
        } else if (status === 404) {
          msg = 'Blok atau Gateway tidak ditemukan di server.'
        } else if (errObj.message) {
          msg = String(errObj.message)
        }
      }
      setError(msg)
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
        <form onSubmit={handleSubmit} className="space-y-5 pt-1 text-left">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-1">
              <p>{error}</p>
              {isSubscriptionError && (
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
              className="block text-xs font-semibold text-slate-700"
            >
              Langkah 1: Penempatan Blok Lahan <span className="text-rose-600 font-bold ml-0.5">*</span>
            </label>
            <select
              id="select-blok-lahan"
              value={selectedBlockId}
              onChange={(e) => {
                setSelectedBlockId(e.target.value)
                if (error) setError(null)
              }}
              required
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer pr-8"
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
            <p className="text-[11px] text-slate-500">
              Satu blok lahan hanya dapat dipasangkan dengan satu unit node sensor.
            </p>
          </div>

          {/* LANGKAH 2: PILIH GATEWAY BLOK */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between min-h-[20px]">
              <label
                htmlFor="select-gateway-iot"
                className="block text-xs font-semibold text-slate-700"
              >
                Langkah 2: Gateway IoT Blok <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              {selectedBlockId && !(isLoadingGateways || filteredGateways.length === 0) && (
                <button
                  type="button"
                  onClick={() => setIsQuickGatewayOpen(true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Gateway</span>
                </button>
              )}
            </div>
            <select
              id="select-gateway-iot"
              value={selectedGatewayId}
              onChange={(e) => {
                setSelectedGatewayId(e.target.value)
                if (error) setError(null)
              }}
              required
              disabled={!selectedBlockId || isLoadingGateways || filteredGateways.length === 0}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed cursor-pointer pr-8"
            >
              {!selectedBlockId ? (
                <option value="">Pilih Blok Lahan pada langkah 1 terlebih dahulu</option>
              ) : isLoadingGateways ? (
                <option value="">Memuat daftar gateway blok...</option>
              ) : filteredGateways.length === 0 ? (
                <option value="">Belum ada gateway di blok ini</option>
              ) : (
                <>
                  <option value="">Pilih Gateway IoT</option>
                  {filteredGateways.map((gtw) => {
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
            {selectedBlockId && !isLoadingGateways && filteredGateways.length === 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-1.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Blok lahan yang dipilih belum memiliki perangkat Gateway IoT. Setiap node sensor membutuhkan Gateway aktif di blok tersebut untuk meneruskan data telemetri.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuickGatewayOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="bg-white border-slate-300 text-slate-800 hover:bg-slate-100 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Buat Gateway untuk Blok Ini
                </Button>
              </div>
            )}
          </div>

          {/* LANGKAH 3: KODE PERANGKAT & TIPE SENSOR */}
          <div className="space-y-4 pt-1">
            {/* Input Kode Perangkat */}
            <div className="space-y-1">
              <label
                htmlFor="input-kode-perangkat"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Langkah 3: Kode Perangkat Node Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <div className="relative rounded-xl">
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
                  className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Kode unik penanda perangkat di lapangan (contoh: ND-BLOKA-01). Stiker QR akan dibuat otomatis setelah disimpan.
              </p>
            </div>

            {/* Dropdown Tipe Sensor */}
            <div className="space-y-1.5">
              <label
                htmlFor="select-tipe-sensor"
                className="block text-xs font-semibold text-slate-700"
              >
                Tipe Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <select
                id="select-tipe-sensor"
                value={tipeSensor}
                onChange={(e) => setTipeSensor(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer pr-8"
              >
                <option value="cahaya_lux">Sensor Intensitas Cahaya (Lux) & Suhu</option>
                <option value="cahaya">Sensor Intensitas Cahaya (Lux)</option>
                <option value="suhu">Sensor Suhu Lingkungan</option>
                <option value="kelembapan">Sensor Kelembapan Tanah dan Udara</option>
              </select>
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
              disabled={isSubmitting || (Boolean(selectedBlockId) && filteredGateways.length === 0)}
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

      {/* Modal Sukses Penerbitan QR Node Baru Otomatis */}
      {newNodeQrSuccess && (
        <NewNodeQrSuccessModal
          isOpen={Boolean(newNodeQrSuccess)}
          onClose={() => {
            setNewNodeQrSuccess(null)
            onClose()
          }}
          nodeCode={newNodeQrSuccess.nodeCode}
          qrCodeText={newNodeQrSuccess.qrCodeText}
          farmName={newNodeQrSuccess.farmName}
          blockName={newNodeQrSuccess.blockName}
        />
      )}
    </>
  )
}
