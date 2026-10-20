import { useState, useMemo, type FC } from 'react'
import {
  History,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { useAdminLogs } from '@/hooks/useAdmin'
import { resolveAdminName } from '@/types/admin.types'
import { formatDateTime } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { DebouncedSearchInput } from '@/components/common/DebouncedSearchInput'

export const AdminAuditLogsPage: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  const { data, isPending, isError, error, refetch, isFetching } = useAdminLogs(currentPage)

  const meta = data?.meta || {
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  }

  const filteredLogs = useMemo(() => {
    const list = data?.data || []
    if (!debouncedSearchQuery.trim()) return list
    const q = debouncedSearchQuery.trim().toLowerCase()
    return list.filter((log) => {
      const adminName = resolveAdminName(log).toLowerCase()
      return (
        adminName.includes(q) ||
        (log.aksi || '').toLowerCase().includes(q) ||
        (log.target_tipe || '').toLowerCase().includes(q) ||
        String(log.target_id || '').toLowerCase().includes(q) ||
        (log.keterangan || '').toLowerCase().includes(q)
      )
    })
  }, [data?.data, debouncedSearchQuery])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Audit Log Aktivitas Admin
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {filteredLogs.length} Jejak Aktivitas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak seluruh mutasi konfigurasi, otorisasi inspeksi, dan tindakan administratif Super Admin platform.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <DebouncedSearchInput
            value={debouncedSearchQuery}
            onDebouncedChange={(val) => {
              setDebouncedSearchQuery(val)
              setCurrentPage(1)
            }}
            delay={1000}
            placeholder="Cari admin, aksi, target, keterangan..."
            ariaLabel="Cari admin, jenis aksi, tipe target, atau keterangan log"
            className="w-full"
          />
        </div>
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
                  <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-72 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" />
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
            <h2 className="text-base font-bold text-slate-900">Gagal Memuat Log Aktivitas</h2>
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
        /* Logs Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Waktu Kejadian</th>
                  <th className="py-3.5 px-4">Admin Pelaku</th>
                  <th className="py-3.5 px-4">Aksi</th>
                  <th className="py-3.5 px-4">Tipe Target</th>
                  <th className="py-3.5 px-4">ID Target</th>
                  <th className="py-3.5 px-4">Keterangan Tambahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Tidak ada catatan aktivitas ditemukan</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {debouncedSearchQuery ? 'Coba ganti kata kunci pencarian Anda.' : 'Audit trail belum memiliki rekaman aktivitas.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const rawTime = log.waktu ?? log.created_at
                    const formattedTime = rawTime ? formatDateTime(rawTime) : '-'
                    const adminName = resolveAdminName(log)
                    const keteranganText = log.keterangan?.trim() || '-'

                    return (
                      <tr
                        key={log.id_log ?? log.id ?? `${log.aksi}-${rawTime ?? idx}-${idx}`}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 font-mono">
                          {formattedTime}
                        </td>

                        {/* Admin Pelaku */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs font-semibold text-slate-900">
                          {adminName}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200">
                            {log.aksi}
                          </span>
                        </td>

                        {/* Tipe Target */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs font-medium text-slate-700">
                          {log.target_tipe}
                        </td>

                        {/* ID Target */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-500">
                          #{log.target_id}
                        </td>

                        {/* Keterangan */}
                        <td className="py-3.5 px-4 text-sm text-slate-600 leading-relaxed max-w-md">
                          {keteranganText}
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
              Menampilkan halaman <strong>{meta.current_page}</strong> dari <strong>{meta.last_page}</strong> (total {meta.total} rekaman log)
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
    </div>
  )
}

export default AdminAuditLogsPage
