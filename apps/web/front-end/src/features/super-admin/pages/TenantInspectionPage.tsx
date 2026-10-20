import { useState, useMemo, type FC } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowLeft,
  Sprout,
  Layers,
  Cpu,
  Wifi,
  QrCode,
  Activity,
  Lightbulb,
  Radio,
  KeyRound,
  RefreshCw,
} from 'lucide-react'
import {
  useTenantFarms,
  useTenantBlocks,
  useTenantNodes,
  useTenantGateways,
  useTenantLampStatus,
  useAdminAccessHistoryQuery,
} from '@/hooks/useAdmin'
import type { BlokBackend } from '@/types/block.types'
import type { NodeSensorBackend } from '@/types/node.types'
import type { GatewayInspectionItem } from '@/types/admin.types'
import { formatDateTime } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { Toast, type ToastType } from '@/components/feedback/Toast'
import { TenantAccessModal } from '../components/TenantAccessModal'

/**
 * Komponen Kartu Blok dengan Status Lampu & Heartbeat Riil
 */
interface BlockCardProps {
  tenantId: string
  blok: BlokBackend
}

const BlockInspectionCard: FC<BlockCardProps> = ({ tenantId, blok }) => {
  const blokId = blok.id_blok || blok.id || ''
  const { data: lampStatus, isPending: isLampPending } = useTenantLampStatus(tenantId, blokId)

  const isLampOn = lampStatus?.status_lampu === 'menyala' || lampStatus?.status_lampu === 'on'

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
            <h3 className="text-sm font-bold text-slate-900">{blok.nama_blok}</h3>
          </div>
          <p className="text-xs text-slate-500">
            Luas Area: {blok.luas_area ? `${blok.luas_area} m²` : 'Tidak dispesifikasikan'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span className={`w-1.5 h-1.5 rounded-full ${isLampOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span>{isLampOn ? 'Lampu Aktif' : 'Lampu Siaga'}</span>
        </div>
      </div>

      {blok.keterangan && (
        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {blok.keterangan}
        </p>
      )}

      {/* Telemetri Status Lampu & Heartbeat */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
            <span>Kondisi Lampu</span>
          </span>
          <p className="font-semibold text-slate-900">
            {isLampPending ? 'Memeriksa...' : isLampOn ? 'Menyala (Aktif)' : 'Mati / Siaga'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
            <span>Heartbeat Terakhir</span>
          </span>
          <p className="font-semibold text-slate-900">
            {isLampPending
              ? 'Memeriksa...'
              : lampStatus?.terakhir_aktif
                ? formatDateTime(lampStatus.terakhir_aktif)
                : 'Belum ada sinyal'}
          </p>
        </div>
      </div>

      {lampStatus?.mode && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Mode Kontrol:</span>
          <span className="font-semibold text-slate-700 capitalize px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
            {lampStatus.mode}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Halaman Mode Inspeksi Kebun Tenant (Read-Only)
 */
export const TenantInspectionPage: FC = () => {
  const { tenantId = '' } = useParams<{ tenantId: string }>()
  const [selectedKebunId, setSelectedKebunId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'blok' | 'node' | 'gateway'>('blok')

  // Toast feedback state
  const [toastState, setToastState] = useState<{
    isVisible: boolean
    type: ToastType
    title: string
    message: string
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Modal Akses
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)

  // Tahap 1: Fetch Kebun Milik Tenant
  const {
    data: farms = [],
    isPending: isFarmsPending,
    isError: isFarmsError,
    error: farmsError,
    refetch: refetchFarms,
    isFetching: isFarmsFetching,
  } = useTenantFarms(tenantId)

  const { data: accessHistory = [] } = useAdminAccessHistoryQuery()
  const tenantRows = useMemo(
    () => accessHistory.filter((h) => String(h.tenant_id) === String(tenantId)),
    [accessHistory, tenantId]
  )
  const isAccessPending = useMemo(
    () => tenantRows.some((h) => h.status === 'pending'),
    [tenantRows]
  )

  // Cek apakah error 403 Forbidden (Izin Akses Belum Diberikan)
  const isConsentLocked = useMemo(() => {
    if (!isFarmsError) return false
    const errObj = farmsError as { status?: number; message?: string }
    const status = errObj?.status
    const msg = (errObj?.message || '').toLowerCase()
    return status === 403 || msg.includes('izin') || msg.includes('403') || msg.includes('forbidden')
  }, [isFarmsError, farmsError])

  // Kebun aktif terpilih
  const currentKebunId = useMemo(() => {
    if (selectedKebunId) return selectedKebunId
    if (farms.length > 0) {
      return farms[0].id_kebun || farms[0].id || ''
    }
    return ''
  }, [selectedKebunId, farms])

  // Tahap 3: Fetch Data Berdasarkan selectedKebunId
  const {
    data: blocks = [],
    isPending: isBlocksPending,
    refetch: refetchBlocks,
  } = useTenantBlocks(tenantId, currentKebunId)

  const {
    data: nodes = [],
    isPending: isNodesPending,
    refetch: refetchNodes,
  } = useTenantNodes(tenantId, currentKebunId)

  const {
    data: gateways = [],
    isPending: isGatewaysPending,
    refetch: refetchGateways,
  } = useTenantGateways(tenantId, currentKebunId)

  const handleRefreshAll = () => {
    refetchFarms()
    if (currentKebunId) {
      refetchBlocks()
      refetchNodes()
      refetchGateways()
    }
  }

  // 1. Consent Locked State (HTTP 403)
  if (isConsentLocked) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tenant"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Kembali ke Daftar Tenant</span>
          </Link>
        </div>

        {/* Banner Tenang */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-emerald-400 shrink-0" strokeWidth={1.75} />
            <div>
              <div className="text-xs font-semibold text-emerald-400">Mode Inspeksi Support (Read-Only)</div>
              <p className="text-xs text-slate-300">
                Pemeriksaan teknis operasional lapangan untuk Tenant ID: {tenantId}
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Akses Terkunci
          </span>
        </div>

        {/* Clean Consent Locked State Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7 text-slate-600" strokeWidth={1.75} />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">
              {isAccessPending ? 'Permintaan Akses Menunggu Otorisasi' : 'Izin Akses Tenant Belum Diberikan'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAccessPending
                ? 'Permintaan akses inspeksi telah diajukan kepada pengelola tenant ini dan sedang menunggu persetujuan. Anda akan dapat mengakses data setelah disetujui.'
                : 'Super Admin belum memiliki otorisasi untuk membuka konfigurasi kebun, blok, dan telemetri perangkat tenant ini. Silakan ajukan permintaan akses resmi kepada pengelola tenant.'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {isAccessPending ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed inline-flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                <span>Menunggu Persetujuan Pengelola</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsAccessModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>Ajukan Permintaan Akses</span>
              </Button>
            )}
          </div>
        </div>

        {/* Modal Minta Akses */}
        <TenantAccessModal
          isOpen={isAccessModalOpen}
          onClose={() => setIsAccessModalOpen(false)}
          tenantId={tenantId}
          tenantName={`Tenant #${tenantId}`}
          onSuccess={(msg) => {
            setToastState({
              isVisible: true,
              type: 'success',
              title: 'Permintaan Akses Terkirim',
              message: msg,
            })
          }}
        />

        {toastState.isVisible && (
          <div className="fixed top-5 right-5 z-50">
            <Toast
              type={toastState.type}
              title={toastState.title}
              message={toastState.message}
              isVisible={toastState.isVisible}
              onClose={() => setToastState((prev) => ({ ...prev, isVisible: false }))}
            />
          </div>
        )}
      </div>
    )
  }

  // 2. Loading State
  if (isFarmsPending) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-16 w-full bg-slate-200 rounded-2xl animate-pulse" />
        <div className="h-12 w-96 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
              <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 3. Empty State (Tidak Ada Kebun)
  if (!farms || farms.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tenant"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Kembali ke Daftar Tenant</span>
          </Link>
        </div>

        {/* Banner Tenang */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-emerald-400 shrink-0" strokeWidth={1.75} />
            <div>
              <div className="text-xs font-semibold text-emerald-400">Mode Inspeksi Support (Read-Only)</div>
              <p className="text-xs text-slate-300">
                Pemeriksaan teknis operasional lapangan untuk Tenant ID: {tenantId}
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Read-Only
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
            <Sprout className="w-7 h-7 text-slate-400" strokeWidth={1.75} />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-base font-bold text-slate-900">Tenant Ini Belum Memiliki Data Kebun</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tidak ditemukan data perkebunan aktif yang terdaftar atas nama tenant ini di sistem.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/tenant"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span>Pilih Tenant Lain</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 4. State Normal: Data Kebun Ditemukan
  const activeKebun = farms.find(
    (k) => (k.id_kebun || k.id) === currentKebunId
  ) || farms[0]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toastState.isVisible && (
        <div className="fixed top-5 right-5 z-50">
          <Toast
            type={toastState.type}
            title={toastState.title}
            message={toastState.message}
            isVisible={toastState.isVisible}
            onClose={() => setToastState((prev) => ({ ...prev, isVisible: false }))}
          />
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/tenant"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Kembali ke Daftar Tenant</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isFarmsFetching}
            className="flex items-center gap-1.5 text-xs text-slate-700 bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFarmsFetching ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Perbarui Data</span>
          </Button>
        </div>
      </div>

      {/* Banner Tenang Read-Only */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-emerald-400 shrink-0" strokeWidth={1.75} />
          <div>
            <div className="text-xs font-semibold text-emerald-400">
              Mode Inspeksi Support (Read-Only) [Tenant: {tenantId}]
            </div>
            <p className="text-xs text-slate-300">
              Akses pemantauan operasional lapangan untuk keperluan audit dan investigasi teknis. Seluruh tombol mutasi dinonaktifkan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            Tenant: {tenantId}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
            Izin Terverifikasi
          </span>
        </div>
      </div>

      {/* Tahap 2: Selector Kebun Aktif (Pill Tabs) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Pilih Kebun Mitra ({farms.length} Terdaftar)
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {farms.map((kebun) => {
            const kebunId = kebun.id_kebun || kebun.id || ''
            const isSelected = kebunId === currentKebunId

            return (
              <button
                key={kebunId}
                type="button"
                onClick={() => setSelectedKebunId(kebunId)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Sprout className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{kebun.nama_kebun}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Ringkasan Kebun Terpilih */}
      {activeKebun && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{activeKebun.nama_kebun}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  ID: {activeKebun.id_kebun || activeKebun.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Lokasi: {activeKebun.lokasi_kebun || 'Tidak dicantumkan'}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Blok</span>
                <span className="text-sm font-bold text-slate-900">{blocks.length}</span>
              </div>
              <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Node Sensor</span>
                <span className="text-sm font-bold text-slate-900">{nodes.length}</span>
              </div>
              <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Gateway</span>
                <span className="text-sm font-bold text-slate-900">{gateways.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation Komponen Lapangan */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('blok')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'blok'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Daftar Blok & Status Lampu ({blocks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('node')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'node'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Node Sensor & QR Code ({nodes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gateway')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'gateway'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wifi className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Gateway Lapangan ({gateways.length})</span>
        </button>
      </div>

      {/* Konten Tab 1: Blok & Status Lampu */}
      {activeTab === 'blok' && (
        <div className="space-y-4">
          {isBlocksPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 p-5 animate-pulse" />
              ))}
            </div>
          ) : blocks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" strokeWidth={1.75} />
              <p className="text-xs font-semibold text-slate-700">Belum ada blok terdaftar pada kebun ini</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Pengelola kebun belum menambahkan pembagian blok lahan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {blocks.map((blok) => (
                <BlockInspectionCard key={blok.id_blok || blok.id} tenantId={tenantId} blok={blok} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Konten Tab 2: Node Sensor & QR Code */}
      {activeTab === 'node' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {isNodesPending ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : nodes.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-2" strokeWidth={1.75} />
              <p className="text-xs font-semibold text-slate-700">Belum ada node sensor terpasang di kebun ini</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Perangkat IoT telemetri belum didaftarkan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Kode Perangkat</th>
                    <th className="py-3.5 px-4">Tipe Sensor</th>
                    <th className="py-3.5 px-4">Status Koneksi</th>
                    <th className="py-3.5 px-4">Penempatan Blok</th>
                    <th className="py-3.5 px-4">Kode QR</th>
                    <th className="py-3.5 px-4">Terakhir Terlihat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nodes.map((node: NodeSensorBackend) => {
                    const isOnline =
                      node.status_koneksi === 'aktif' ||
                      node.status_koneksi === 'online' ||
                      node.status_koneksi === 'terhubung'

                    return (
                      <tr key={node.id_sensor || node.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                            <span>{node.kode_perangkat}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 capitalize">
                          {node.tipe_sensor || 'Sensor Lapangan'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{isOnline ? 'Terhubung' : 'Terputus'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {node.blok?.nama_blok || 'Belum Terpasang'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <QrCode className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                            <span>{node.qr?.id_qr || node.qr_id || 'Tanpa QR'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {node.terakhir_terlihat ? formatDateTime(node.terakhir_terlihat) : 'Belum pernah'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Konten Tab 3: Gateway Lapangan */}
      {activeTab === 'gateway' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {isGatewaysPending ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : gateways.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <Wifi className="w-8 h-8 text-slate-300 mx-auto mb-2" strokeWidth={1.75} />
              <p className="text-xs font-semibold text-slate-700">Belum ada gateway terdaftar di kebun ini</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Perangkat gateway LoRa atau WiFi belum didaftarkan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Kode Gateway</th>
                    <th className="py-3.5 px-4">Status Koneksi</th>
                    <th className="py-3.5 px-4">Terakhir Terlihat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gateways.map((gw: GatewayInspectionItem) => {
                    const isOnline =
                      gw.status_koneksi === 'terhubung' ||
                      gw.status_koneksi === 'online' ||
                      gw.status_koneksi === 'aktif'

                    return (
                      <tr key={gw.id_gateway} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Wifi className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                            <span>{gw.kode_perangkat}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {gw.terakhir_terlihat ? formatDateTime(gw.terakhir_terlihat) : 'Belum pernah'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TenantInspectionPage
