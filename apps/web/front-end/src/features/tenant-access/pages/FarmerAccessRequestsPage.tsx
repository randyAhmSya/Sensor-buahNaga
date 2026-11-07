import { useState, type FC } from 'react'
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  FileText,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantService } from '@/services/tenantService'
import { tenantKeys } from '@/services/queryKeys'
import type { PetaniTenantAccessItem } from '@/types/tenantAccess.types'
import { useNotify } from '@/context/NotificationContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export const FarmerAccessRequestsPage: FC = () => {
  const notify = useNotify()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'Semua' | 'pending' | 'disetujui' | 'ditolak_dicabut'>('Semua')

  // Reject Modal State
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean
    id: string | number
    alasan: string
  }>({
    isOpen: false,
    id: '',
    alasan: '',
  })

  // Revoke Modal State
  const [revokeModal, setRevokeModal] = useState<{
    isOpen: boolean
    id: string | number
  }>({
    isOpen: false,
    id: '',
  })

  // Detail Modal State
  const [detailItem, setDetailItem] = useState<PetaniTenantAccessItem | null>(null)

  const showToast = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    notify[type](title, message)
  }

  // 1. Fetch Requests
  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<PetaniTenantAccessItem[], Error>({
    queryKey: tenantKeys.aksesRequests(),
    queryFn: () => tenantService.getAccessRequests(),
    staleTime: 30 * 1000,
  })

  // 2. Approve Mutation
  const approveMutation = useMutation<void, Error, string | number>({
    mutationFn: (id) => tenantService.approveAccess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.aksesRequests() })
      showToast('Akses Diberikan', 'Izin inspeksi teknis berhasil disetujui.')
    },
    onError: (err) => {
      showToast('Gagal', err.message || 'Gagal menyetujui akses.', 'error')
    },
  })

  // 3. Reject Mutation
  const rejectMutation = useMutation<void, Error, { id: string | number; alasan?: string }>({
    mutationFn: ({ id, alasan }) => tenantService.rejectAccess(id, alasan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.aksesRequests() })
      setRejectModal({ isOpen: false, id: '', alasan: '' })
      showToast('Permintaan Ditolak', 'Permintaan akses teknis telah ditolak.')
    },
    onError: (err) => {
      showToast('Gagal', err.message || 'Gagal menolak akses.', 'error')
    },
  })

  // 4. Revoke Mutation
  const revokeMutation = useMutation<void, Error, string | number>({
    mutationFn: (id) => tenantService.revokeAccess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.aksesRequests() })
      setRevokeModal({ isOpen: false, id: '' })
      showToast('Akses Dicabut', 'Izin akses inspeksi telah resmi dicabut.')
    },
    onError: (err) => {
      showToast('Gagal', err.message || 'Gagal mencabut akses.', 'error')
    },
  })

  const isActionPending =
    approveMutation.isPending || rejectMutation.isPending || revokeMutation.isPending

  const countMenunggu = requests.filter((r) => r.status === 'pending').length
  const countDisetujui = requests.filter((r) => r.status === 'disetujui').length
  const countDitolakDicabut = requests.filter(
    (r) => r.status === 'ditolak' || r.status === 'dicabut'
  ).length

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'Semua') return true
    if (activeTab === 'pending') return r.status === 'pending'
    if (activeTab === 'disetujui') return r.status === 'disetujui'
    if (activeTab === 'ditolak_dicabut') return r.status === 'ditolak' || r.status === 'dicabut'
    return true
  })

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '-'
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Otorisasi Akses Super Admin
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" strokeWidth={1.75} />
              Kontrol Keamanan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola izin inspeksi staf teknis dan super admin ke konfigurasi kebun serta telemetri perangkat Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-600 shrink-0 ${isFetching ? 'animate-spin' : ''}`} strokeWidth={1.75} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Menunggu Persetujuan
            </span>
            <Clock className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{countMenunggu}</span>
            <span className="text-xs font-bold text-slate-600">Perlu Tindakan</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Permintaan masuk dari admin pusat</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Akses Diizinkan
            </span>
            <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{countDisetujui}</span>
            <span className="text-xs font-bold text-emerald-600">Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dapat menginspeksi telemetry kebun</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ditolak / Dicabut
            </span>
            <XCircle className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">{countDitolakDicabut}</span>
            <span className="text-xs font-bold text-slate-500">Nonaktif</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Akses tidak diberikan atau sudah dihentikan</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(
          [
            { key: 'Semua', label: `Semua (${requests.length})` },
            { key: 'pending', label: `Menunggu (${countMenunggu})` },
            { key: 'disetujui', label: `Diizinkan (${countDisetujui})` },
            { key: 'ditolak_dicabut', label: `Ditolak / Dicabut (${countDitolakDicabut})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
            <p>Memuat daftar permohonan akses tenant...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-slate-600 space-y-3">
            <p className="font-semibold text-slate-900">Gagal memuat data otorisasi akses.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Tidak ada data permintaan akses</p>
            <p className="text-[11px] text-slate-400">
              Belum ada permohonan akses dari Super Admin pada kategori ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">ID & Tanggal</th>
                  <th className="py-3.5 px-6">Pemohon</th>
                  <th className="py-3.5 px-6">Alasan Permintaan</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Tindakan Otorisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((item) => {
                  const displayReason = item.alasan_permintaan ?? item.alasan ?? '-'
                  const adminName = item.admin?.nama || `Super Admin #${item.admin_id}`

                  return (
                    <tr key={item.id_akses || item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-mono text-[10px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded inline-block">
                          #{item.id_akses || item.id}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">{formatDate(item.diminta_pada)}</p>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{adminName}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.admin?.email || 'Tim Teknis Platform'}
                        </p>
                      </td>

                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-slate-700 text-xs line-clamp-2" title={displayReason}>
                          {displayReason}
                        </p>
                        {item.alasan_penolakan && (
                          <p className="text-[11px] text-slate-500 mt-1 italic">
                            Catatan penolakan: {item.alasan_penolakan}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                            Menunggu Otorisasi
                          </span>
                        )}
                        {item.status === 'disetujui' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Akses Diizinkan
                          </span>
                        )}
                        {item.status === 'ditolak' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Ditolak
                          </span>
                        )}
                        {item.status === 'dicabut' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Dicabut
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {item.status === 'pending' && (
                            <>
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={isActionPending}
                                onClick={() => approveMutation.mutate(item.id_akses || item.id || '')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                              >
                                {approveMutation.isPending && (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                )}
                                <span>Setujui</span>
                              </Button>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isActionPending}
                                onClick={() =>
                                  setRejectModal({
                                    isOpen: true,
                                    id: item.id_akses || item.id || '',
                                    alasan: '',
                                  })
                                }
                                className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                              >
                                <span>Tolak</span>
                              </Button>
                            </>
                          )}

                          {item.status === 'disetujui' && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isActionPending}
                              onClick={() =>
                                setRevokeModal({
                                  isOpen: true,
                                  id: item.id_akses || item.id || '',
                                })
                              }
                              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                            >
                              <span>Cabut Izin Akses</span>
                            </Button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDetailItem(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Detail Permohonan"
                          >
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tolak Permintaan */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={() => !isActionPending && setRejectModal((prev) => ({ ...prev, isOpen: false }))}
        title="Tolak Permohonan Akses"
        description="Sampaikan catatan alasan penolakan izin akses inspeksi kepada staf pusat."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="alasan-penolakan" className="block text-xs font-semibold text-slate-700">
                Alasan Penolakan <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {rejectModal.alasan.length}/500
              </span>
            </div>
            <textarea
              id="alasan-penolakan"
              rows={3}
              maxLength={500}
              value={rejectModal.alasan}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, alasan: e.target.value }))}
              placeholder="Contoh: Sedang dalam masa pemeliharaan internal kebun..."
              disabled={isActionPending}
              className="w-full text-xs text-slate-900 rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all placeholder:text-slate-400 disabled:bg-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isActionPending}
              onClick={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isActionPending}
              onClick={() =>
                rejectMutation.mutate({
                  id: rejectModal.id,
                  alasan: rejectModal.alasan.trim() || undefined,
                })
              }
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              {rejectMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Konfirmasi Tolak</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Cabut Izin Akses */}
      <Modal
        isOpen={revokeModal.isOpen}
        onClose={() => !isActionPending && setRevokeModal({ isOpen: false, id: '' })}
        title="Cabut Izin Akses Inspeksi"
        description="Apakah Anda yakin ingin segera menghentikan akses inspeksi teknis dari staf pusat ke kebun Anda?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Setelah izin dicabut, sesi peninjauan data oleh Super Admin akan terkunci kembali secara otomatis.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isActionPending}
              onClick={() => setRevokeModal({ isOpen: false, id: '' })}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isActionPending}
              onClick={() => revokeMutation.mutate(revokeModal.id)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              {revokeMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Ya, Cabut Akses</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Detail */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
                <h3 className="text-base font-bold text-slate-900">Detail Permohonan Akses</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <p className="text-slate-400 font-semibold">Nomor Tiket:</p>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">#{detailItem.id_akses || detailItem.id}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Waktu Pengajuan:</p>
                  <p className="font-bold text-slate-800 mt-0.5">{formatDate(detailItem.diminta_pada)}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-semibold">Pemohon Akses:</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {detailItem.admin?.nama || `Super Admin #${detailItem.admin_id}`}
                </p>
                <p className="text-slate-500">{detailItem.admin?.email || 'Staf Teknis Platform'}</p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold">Status Akses:</p>
                <div className="mt-1">
                  {detailItem.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Menunggu Otorisasi
                    </span>
                  )}
                  {detailItem.status === 'disetujui' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Akses Diizinkan
                    </span>
                  )}
                  {detailItem.status === 'ditolak' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Ditolak
                    </span>
                  )}
                  {detailItem.status === 'dicabut' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Dicabut
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-semibold">Alasan Permintaan:</p>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed mt-1">
                  {detailItem.alasan_permintaan ?? detailItem.alasan ?? '-'}
                </p>
              </div>

              {detailItem.alasan_penolakan && (
                <div>
                  <p className="text-slate-400 font-semibold">Alasan Penolakan:</p>
                  <p className="p-3 bg-slate-100 rounded-xl text-slate-800 leading-relaxed mt-1">
                    {detailItem.alasan_penolakan}
                  </p>
                </div>
              )}

              {detailItem.diputuskan_oleh && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <p className="text-slate-400 font-semibold">Diputuskan Oleh:</p>
                    <p className="font-bold text-slate-800 mt-0.5">{detailItem.diputuskan_oleh}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Waktu Keputusan:</p>
                    <p className="font-bold text-slate-800 mt-0.5">{formatDate(detailItem.diputuskan_pada)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerAccessRequestsPage
