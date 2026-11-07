import { useState, useMemo, type FC } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Banknote,
  Package,
} from 'lucide-react'
import { useAdminTransactions } from '@/hooks/useAdmin'
import type { TransactionStatus } from '@/types/admin.types'
import { formatRupiah, formatIndoDate } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { useNotify } from '@/context/NotificationContext'
import { DebouncedSearchInput } from '@/components/common/DebouncedSearchInput'
import { TransactionProofModal } from '../components/TransactionProofModal'
import { TransactionVerifyModal } from '../components/TransactionVerifyModal'
import { TransactionRejectModal } from '../components/TransactionRejectModal'

const STATUS_TABS: { key: TransactionStatus; label: string }[] = [
  { key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
  { key: 'berhasil', label: 'Diverifikasi' },
  { key: 'ditolak', label: 'Ditolak' },
]

export const SubscriptionsPage: FC = () => {
  const notify = useNotify()
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>('menunggu_verifikasi')
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Modal States
  const [proofModal, setProofModal] = useState<{
    isOpen: boolean
    transactionId: string | number
    tenantName: string
  }>({
    isOpen: false,
    transactionId: '',
    tenantName: '',
  })

  const [verifyModal, setVerifyModal] = useState<{
    isOpen: boolean
    transactionId: string | number
    tenantName: string
    packageName: string
  }>({
    isOpen: false,
    transactionId: '',
    tenantName: '',
    packageName: '',
  })

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean
    transactionId: string | number
    tenantName: string
  }>({
    isOpen: false,
    transactionId: '',
    tenantName: '',
  })

  const { data, isPending, isError, error, refetch, isFetching } = useAdminTransactions(
    selectedStatus,
    currentPage
  )

  const showToast = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    notify[type](title, message)
  }

  const meta = data?.meta || {
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  }

  const filteredTransactions = useMemo(() => {
    const list = data?.data || []
    if (!debouncedSearchQuery.trim()) return list
    const q = debouncedSearchQuery.trim().toLowerCase()
    return list.filter((tx) => (
      String(tx.id).toLowerCase().includes(q) ||
      (tx.nama_tenant || '').toLowerCase().includes(q) ||
      (tx.nama_paket || '').toLowerCase().includes(q) ||
      (tx.metode_pembayaran || '').toLowerCase().includes(q)
    ))
  }, [data?.data, debouncedSearchQuery])

  const handleTabChange = (status: TransactionStatus) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Verifikasi Transaksi Langganan
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {filteredTransactions.length} Pengajuan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tinjau bukti transfer pembayaran langganan tenant, validasi mutasi rekening, dan otorisasi perpanjangan layanan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/paket"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <Package className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
            <span>Katalog Paket</span>
          </Link>

          {/* Search */}
          <div className="w-full sm:w-72">
            <DebouncedSearchInput
              value={debouncedSearchQuery}
              onDebouncedChange={(val) => {
                setDebouncedSearchQuery(val)
                setCurrentPage(1)
              }}
              delay={1000}
              placeholder="Cari ID transaksi, tenant, paket..."
              ariaLabel="Cari ID transaksi, tenant, atau nama paket"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatus === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Loading Skeleton */}
      {isPending ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-56 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-8 w-28 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Gagal Memuat Daftar Transaksi</h2>
            <p className="text-xs text-slate-500 mt-1">{error?.message || 'Koneksi ke server bermasalah.'}</p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mx-auto"
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        /* Transactions Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">ID Transaksi</th>
                  <th className="py-3.5 px-4">Tenant</th>
                  <th className="py-3.5 px-4">Paket Langganan</th>
                  <th className="py-3.5 px-4">Tambahan Hari</th>
                  <th className="py-3.5 px-4">Harga (IDR)</th>
                  <th className="py-3.5 px-4">Metode Bayar</th>
                  <th className="py-3.5 px-4">Tanggal Pengajuan</th>
                  <th className="py-3.5 px-4">Bukti Transfer</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        Tidak ada transaksi dengan status "{selectedStatus.replace('_', ' ')}"
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {debouncedSearchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Semua transaksi pada filter ini telah diproses.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isPendingAction = tx.status === 'menunggu_verifikasi'
                    const isSuccess = tx.status === 'berhasil' || tx.status === 'diverifikasi'
                    const isRejected = tx.status === 'ditolak'
                    const isWaitingPayment = tx.status === 'menunggu_pembayaran'

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* ID Transaksi */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          #{tx.id}
                        </td>

                        {/* Tenant */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {tx.nama_tenant}
                        </td>

                        {/* Paket */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {tx.nama_paket}
                          </span>
                        </td>

                        {/* Tambahan Hari */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          +{tx.tambahan_hari} hari
                        </td>

                        {/* Harga */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                          {formatRupiah(tx.harga)}
                        </td>

                        {/* Metode Bayar */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Banknote className="w-3.5 h-3.5 text-slate-400" />
                            {tx.metode_pembayaran || 'Transfer Bank'}
                          </span>
                        </td>

                        {/* Tanggal Pengajuan */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatIndoDate(tx.created_at || tx.tanggal_pengajuan)}
                          </span>
                        </td>

                        {/* Bukti Transfer */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              setProofModal({
                                isOpen: true,
                                transactionId: tx.id,
                                tenantName: tx.nama_tenant,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti</span>
                          </button>
                        </td>

                        {/* Tindakan */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          {isPendingAction ? (
                            <div className="inline-flex items-center gap-2">
                              {/* Verifikasi Button */}
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  setVerifyModal({
                                    isOpen: true,
                                    transactionId: tx.id,
                                    tenantName: tx.nama_tenant,
                                    packageName: tx.nama_paket,
                                  })
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verifikasi</span>
                              </Button>

                              {/* Tolak Button */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setRejectModal({
                                    isOpen: true,
                                    transactionId: tx.id,
                                    tenantName: tx.nama_tenant,
                                  })
                                }
                                className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </Button>
                            </div>
                          ) : isSuccess ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Diverifikasi
                            </span>
                          ) : isRejected ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3.5 h-3.5" />
                                Ditolak
                              </span>
                              {tx.alasan_penolakan && (
                                <span
                                  className="text-[11px] text-slate-500 italic max-w-[200px] truncate text-right"
                                  title={tx.alasan_penolakan}
                                >
                                  Alasan: {tx.alasan_penolakan}
                                </span>
                              )}
                            </div>
                          ) : isWaitingPayment ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Menunggu Pembayaran
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {tx.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Menampilkan halaman <strong>{meta.current_page}</strong> dari <strong>{meta.last_page}</strong> (total {meta.total} transaksi)
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isFetching}
                className="flex items-center gap-1 px-2.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </Button>

              <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
                {meta.current_page} / {meta.last_page}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={currentPage >= meta.last_page || isFetching}
                className="flex items-center gap-1 px-2.5"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Bukti Transfer */}
      <TransactionProofModal
        isOpen={proofModal.isOpen}
        onClose={() => setProofModal((prev) => ({ ...prev, isOpen: false }))}
        transactionId={proofModal.transactionId}
        tenantName={proofModal.tenantName}
      />

      {/* Modal Konfirmasi Verifikasi */}
      <TransactionVerifyModal
        isOpen={verifyModal.isOpen}
        onClose={() => setVerifyModal((prev) => ({ ...prev, isOpen: false }))}
        transactionId={verifyModal.transactionId}
        tenantName={verifyModal.tenantName}
        packageName={verifyModal.packageName}
        onSuccess={(msg) => showToast('Verifikasi Berhasil', msg, 'success')}
      />

      {/* Modal Penolakan Transaksi */}
      <TransactionRejectModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
        transactionId={rejectModal.transactionId}
        tenantName={rejectModal.tenantName}
        onSuccess={(msg) => showToast('Transaksi Ditolak', msg, 'warning')}
      />
    </div>
  )
}

export default SubscriptionsPage
