import { useState, useMemo, useCallback, type FC } from 'react'
import {
  Users,
  UserPlus,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Toast, type ToastType } from '@/components/feedback/Toast'
import { DebouncedSearchInput } from '@/components/common/DebouncedSearchInput'
import { useAdminUsers, useAdminTenants } from '@/hooks/useAdmin'
import type { AdminUserItem, AdminUserRole } from '@/types/admin.types'
import { UserCreateModal } from '../components/UserCreateModal'
import { UserToggleStatusModal } from '../components/UserToggleStatusModal'

export const SuperAdminUsersPage: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | AdminUserRole>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'true' | 'false'>('ALL')

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [togglingUser, setTogglingUser] = useState<AdminUserItem | null>(null)

  // Toast state
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

  const showToast = (title: string, message: string, type: ToastType = 'success') => {
    setToastState({
      isVisible: true,
      type,
      title,
      message,
    })
  }

  // TanStack Query untuk data tenant (digunakan untuk fallback pencocokan tenant_id)
  const { data: tenantsResponse } = useAdminTenants(1)

  // TanStack Query untuk data pengguna
  const { data, isLoading, isError, error, refetch } = useAdminUsers({
    page: currentPage,
    per_page: 15,
    role: roleFilter !== 'ALL' ? roleFilter : undefined,
    search: debouncedSearchQuery.trim() || undefined,
    is_aktif: statusFilter !== 'ALL' ? statusFilter : undefined,
  })

  const rawUsers: AdminUserItem[] = useMemo(() => data?.data || [], [data?.data])
  const meta = data?.meta || {
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  }

  // Helper untuk menentukan nama tenant yang akurat
  const getTenantName = useCallback((user: AdminUserItem): string => {
    const isSuper = user.role === 'superAdmin' || user.role === 'SUPER_ADMIN'
    if (isSuper) {
      return 'Pusat Sistem'
    }
    if (user.tenant?.nama_tenant && user.tenant.nama_tenant.trim() !== '') {
      return user.tenant.nama_tenant
    }
    if (user.nama_tenant && user.nama_tenant.trim() !== '') {
      return user.nama_tenant
    }
    if (user.tenant_id && tenantsResponse?.data) {
      const matched = tenantsResponse.data.find(
        (t) => String(t.tenant_id ?? t.id) === String(user.tenant_id)
      )
      if (matched?.nama_tenant) {
        return matched.nama_tenant
      }
    }
    return '-'
  }, [tenantsResponse])

  // Hybrid Filtering: Client-side filtering fallback dengan useMemo
  const filteredUsers = useMemo(() => {
    let list = rawUsers

    // Filter Peran (Role)
    if (roleFilter !== 'ALL') {
      list = list.filter((u) => {
        if (roleFilter === 'superAdmin') {
          return u.role === 'superAdmin' || u.role === 'SUPER_ADMIN'
        }
        if (roleFilter === 'petani_biasa') {
          return u.role === 'petani_biasa' || u.role === 'petani'
        }
        return u.role === roleFilter
      })
    }

    // Filter Status Akun
    if (statusFilter !== 'ALL') {
      const wantActive = statusFilter === 'true'
      list = list.filter((u) => Boolean(u.is_aktif) === wantActive)
    }

    // Filter Kata Kunci Debounce (1000ms)
    const query = debouncedSearchQuery.trim().toLowerCase()
    if (query) {
      list = list.filter((u) => {
        const nameMatch = u.nama_lengkap?.toLowerCase().includes(query)
        const emailMatch = u.email?.toLowerCase().includes(query)
        const roleMatch = String(u.role).toLowerCase().includes(query)
        const tenantMatch = getTenantName(u).toLowerCase().includes(query)
        return Boolean(nameMatch || emailMatch || roleMatch || tenantMatch)
      })
    }

    return list
  }, [rawUsers, roleFilter, statusFilter, debouncedSearchQuery, getTenantName])

  // Helper untuk normalisasi role display
  const renderRoleBadge = (role: string) => {
    const isSuper = role === 'superAdmin' || role === 'SUPER_ADMIN'
    return (
      <span className="inline-flex items-center text-[11px] font-medium text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
        {isSuper ? 'Super Admin' : 'Petani Kebun'}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Kelola Pengguna Sistem
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {filteredUsers.length} Pengguna
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen akun petani kebun dan super admin, kontrol status sesi, dan audit hak akses.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Tambah Pengguna</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Debounced Search Input (1000ms delay) */}
        <DebouncedSearchInput
          value={debouncedSearchQuery}
          onDebouncedChange={(val) => {
            setDebouncedSearchQuery(val)
            setCurrentPage(1)
          }}
          delay={1000}
          placeholder="Cari nama lengkap, email, peran, tenant..."
          ariaLabel="Cari pengguna berdasarkan nama, email, peran, atau tenant"
          className="w-full md:w-80"
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setRoleFilter('ALL')
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                roleFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Peran
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleFilter('petani_biasa')
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                roleFilter === 'petani_biasa'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Petani
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleFilter('superAdmin')
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                roleFilter === 'superAdmin'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Super Admin
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | 'true' | 'false')
              setCurrentPage(1)
            }}
            aria-label="Filter status pengguna"
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-slate-900">Gagal Memuat Data Pengguna</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {error?.message || 'Terjadi kesalahan saat berkomunikasi dengan server backend.'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
            >
              Coba Lagi
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-400 mx-auto" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-slate-900">Tidak Ada Pengguna Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {debouncedSearchQuery
                ? `Tidak ditemukan akun dengan kata kunci "${debouncedSearchQuery}". Coba sesuaikan kata kunci atau filter Anda.`
                : 'Belum ada data pengguna yang terdaftar di sistem.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-[30%]">Nama Lengkap</th>
                  <th className="py-3 px-4 w-[24%]">Alamat Email</th>
                  <th className="py-3 px-4 w-[14%]">Peran</th>
                  <th className="py-3 px-4 w-[16%]">Tenant Terkait</th>
                  <th className="py-3 px-4 w-[10%]">Status</th>
                  <th className="py-3 px-4 text-right w-[6%]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const isActive = Boolean(user.is_aktif)
                  const tenantDisplay = getTenantName(user)
                  const isSuper = user.role === 'superAdmin' || user.role === 'SUPER_ADMIN'

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Nama Lengkap */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {user.nama_lengkap.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span
                              className="font-semibold text-slate-900 block truncate max-w-[150px] sm:max-w-[200px]"
                              title={user.nama_lengkap}
                            >
                              {user.nama_lengkap}
                            </span>
                            <span
                              className="text-[10px] text-slate-400 font-mono truncate max-w-[130px] sm:max-w-[160px] block"
                              title={`ID: ${user.id}`}
                            >
                              ID: {String(user.id)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        <span
                          className="truncate max-w-[160px] sm:max-w-[200px] block"
                          title={user.email}
                        >
                          {user.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {renderRoleBadge(String(user.role))}
                      </td>

                      {/* Tenant Terkait */}
                      <td className="py-3 px-4 text-slate-600">
                        {isSuper ? (
                          <span className="text-[11px] text-slate-400">Pusat Sistem</span>
                        ) : tenantDisplay !== '-' ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-slate-700 font-medium truncate max-w-[140px]"
                            title={tenantDisplay}
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
                            <span className="truncate">{tenantDisplay}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end">
                          {/* Toggle Status */}
                          <Button
                            type="button"
                            variant={isActive ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => setTogglingUser(user)}
                            className={`px-2.5 py-1.5 h-auto text-xs font-medium inline-flex items-center gap-1.5 ${
                              isActive
                                ? 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title={isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          >
                            {isActive ? (
                              <>
                                <ToggleRight className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                                <span>Nonaktifkan</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                                <span>Aktifkan</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-side Pagination Footer */}
        {!isLoading && !isError && filteredUsers.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
            <div>
              Menampilkan <span className="font-semibold text-slate-800">{filteredUsers.length}</span> dari{' '}
              <span className="font-semibold text-slate-800">{meta.total}</span> pengguna (Halaman{' '}
              <span className="font-semibold text-slate-800">{meta.current_page}</span> dari{' '}
              <span className="font-semibold text-slate-800">{meta.last_page || 1}</span>)
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="text-xs flex items-center gap-1 border-slate-200 text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Sebelumnya</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => (p < meta.last_page ? p + 1 : p))}
                disabled={currentPage >= (meta.last_page || 1)}
                className="text-xs flex items-center gap-1 border-slate-200 text-slate-700 disabled:opacity-40"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(msg) => showToast('Berhasil', msg, 'success')}
      />

      <UserToggleStatusModal
        isOpen={Boolean(togglingUser)}
        user={togglingUser}
        onClose={() => setTogglingUser(null)}
        onSuccess={(msg) => showToast('Berhasil', msg, 'success')}
      />
    </div>
  )
}

export default SuperAdminUsersPage
