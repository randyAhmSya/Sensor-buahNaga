import { useState, useMemo, type FC } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { useAdminTenants, useAdminAccessHistoryQuery } from '@/hooks/useAdmin'
import type { AdminTenantItem } from '@/types/admin.types'
import { formatDate } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { DebouncedSearchInput } from '@/components/common/DebouncedSearchInput'
import { useNotify } from '@/context/NotificationContext'
import { TenantAccessModal } from '../components/TenantAccessModal'
import { TenantToggleStatusModal } from '../components/TenantToggleStatusModal'

export const SuperAdminTenantsPage: FC = () => {
  const notify = useNotify()
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Modal State for Minta Akses Kebun
  const [accessModal, setAccessModal] = useState<{
    isOpen: boolean
    tenantId: string | number
    tenantName: string
  }>({
    isOpen: false,
    tenantId: '',
    tenantName: '',
  })

  // Modal State for Toggle Status Tenant
  const [toggleModal, setToggleModal] = useState<{
    isOpen: boolean
    tenantId: string | number
    tenantName: string
    isActive: boolean
  }>({
    isOpen: false,
    tenantId: '',
    tenantName: '',
    isActive: true,
  })

  const { data, isPending, isError, error, refetch, isFetching } = useAdminTenants(currentPage)
  const { data: accessHistory = [] } = useAdminAccessHistoryQuery()

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    notify[type](title, message)
  }

  const meta = data?.meta || {
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  }

  // Client side query filter over currently fetched page dengan useMemo
  const filteredTenants = useMemo(() => {
    const list = data?.data || []
    if (!debouncedSearchQuery.trim()) return list
    const q = debouncedSearchQuery.trim().toLowerCase()
    return list.filter((tenant) => (
      (tenant.nama_tenant || '').toLowerCase().includes(q) ||
      (tenant.email || '').toLowerCase().includes(q) ||
      (tenant.paket_langganan || '').toLowerCase().includes(q)
    ))
  }, [data?.data, debouncedSearchQuery])

  const isTenantActive = (tenant: AdminTenantItem) => {
    if (typeof tenant.is_aktif === 'boolean') return tenant.is_aktif
    if (typeof tenant.status === 'boolean') return tenant.status
    return String(tenant.status).toLowerCase() === 'aktif' || String(tenant.status).toLowerCase() === 'active'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Tenant Mitra</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {filteredTenants.length} Organisasi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh organisasi perkebunan mitra, kontrol status operasional, dan permintaan akses inspeksi kebun.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full sm:w-72">
            <DebouncedSearchInput
              value={debouncedSearchQuery}
              onDebouncedChange={(val) => {
                setDebouncedSearchQuery(val)
                setCurrentPage(1)
              }}
              delay={1000}
              placeholder="Cari nama tenant, email, paket..."
              ariaLabel="Cari nama tenant, email, atau paket langganan"
              className="w-full"
            />
          </div>
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
                  <div className="h-4 w-44 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse" />
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
            <h2 className="text-base font-bold text-slate-900">Gagal Memuat Daftar Tenant</h2>
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
        /* Data Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nama Tenant</th>
                  <th className="py-3.5 px-4">Kebun & Pengguna</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Paket Langganan</th>
                  <th className="py-3.5 px-4">Sisa Hari</th>
                  <th className="py-3.5 px-4">Tanggal Dibuat</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Tidak ada data tenant ditemukan</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {debouncedSearchQuery ? 'Coba ganti kata kunci pencarian Anda.' : 'Belum ada organisasi tenant terdaftar.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant, idx) => {
                    const tenantId = tenant.tenant_id ?? tenant.id ?? `${tenant.nama_tenant}-${idx}`
                    const isAktif = isTenantActive(tenant)

                    return (
                      <tr key={tenantId} className="hover:bg-slate-50/70 transition-colors">
                        {/* Nama Tenant */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                              {(tenant.nama_tenant || 'T').substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900">{tenant.nama_tenant}</span>
                          </div>
                        </td>

                        {/* Kebun & Pengguna */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {tenant.email ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">{tenant.email}</span>
                              {(tenant.jumlah_kebun !== undefined || tenant.jumlah_user !== undefined) && (
                                <span className="text-[11px] text-slate-400">
                                  {tenant.jumlah_kebun ?? 0} Kebun • {tenant.jumlah_user ?? 0} User
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600 font-medium">
                              {tenant.jumlah_kebun ?? 0} Kebun • {tenant.jumlah_user ?? 0} User
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isAktif ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Nonaktif
                            </span>
                          )}
                        </td>

                        {/* Paket */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center text-[11px] font-medium text-slate-700 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 capitalize">
                            {tenant.paket_langganan || 'Dasar'}
                          </span>
                        </td>

                        {/* Sisa Hari */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`font-medium ${tenant.sisa_hari === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
                            {tenant.sisa_hari ?? 0} hari
                          </span>
                        </td>

                        {/* Tanggal Dibuat */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {formatDate(tenant.created_at ?? tenant.terdaftar_pada)}
                        </td>

                        {/* Aksi Buttons */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Priority Matching Status Akses Tenant */}
                            {(() => {
                              const tenantRows = accessHistory.filter(
                                (h) => String(h.tenant_id) === String(tenantId)
                              )
                              const hasApproved = tenantRows.some((h) => h.status === 'disetujui')
                              const hasPending = !hasApproved && tenantRows.some((h) => h.status === 'pending')

                              if (hasApproved) {
                                return (
                                  <Link
                                    to={`/admin/tenant/${tenantId}/inspeksi`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                                    <span>Inspeksi Kebun</span>
                                  </Link>
                                )
                              }

                              if (hasPending) {
                                return (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="text-xs bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-1.5"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                                    <span>Menunggu Persetujuan</span>
                                  </Button>
                                )
                              }

                              return (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setAccessModal({
                                      isOpen: true,
                                      tenantId: tenantId,
                                      tenantName: tenant.nama_tenant,
                                    })
                                  }
                                  className="text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                >
                                  <span>Minta Akses</span>
                                </Button>
                              )
                            })()}

                            {/* Aksi Toggle Status */}
                            <Button
                              type="button"
                              variant={isAktif ? 'outline' : 'primary'}
                              size="sm"
                              onClick={() =>
                                setToggleModal({
                                  isOpen: true,
                                  tenantId: tenantId,
                                  tenantName: tenant.nama_tenant,
                                  isActive: isAktif,
                                })
                              }
                              className={`text-xs ${
                                isAktif
                                  ? 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <span>{isAktif ? 'Nonaktifkan' : 'Aktifkan'}</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Controls */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Menampilkan halaman <strong>{meta.current_page}</strong> dari <strong>{meta.last_page}</strong> (total {meta.total} tenant)
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

      {/* Modal Minta Akses Kebun */}
      <TenantAccessModal
        isOpen={accessModal.isOpen}
        onClose={() => setAccessModal((prev) => ({ ...prev, isOpen: false }))}
        tenantId={accessModal.tenantId}
        tenantName={accessModal.tenantName}
        onSuccess={(msg) => showToast('Permintaan Terkirim', msg, 'success')}
      />

      {/* Modal Toggle Status Tenant */}
      <TenantToggleStatusModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal((prev) => ({ ...prev, isOpen: false }))}
        tenantId={toggleModal.tenantId}
        tenantName={toggleModal.tenantName}
        isCurrentlyActive={toggleModal.isActive}
        onSuccess={(msg) => showToast('Status Diperbarui', msg, 'success')}
      />
    </div>
  )
}

export default SuperAdminTenantsPage
