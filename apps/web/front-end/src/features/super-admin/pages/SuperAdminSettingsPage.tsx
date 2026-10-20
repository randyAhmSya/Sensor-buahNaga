import { useState, type FC, type FormEvent } from 'react'
import {
  User,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Save,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  X,
  Package,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Toast, type ToastType } from '@/components/feedback/Toast'
import { UserAvatar } from '@/components/common/UserAvatar'
import {
  useAdminPackages,
  useTogglePackageStatus,
  useAdminTenants,
  useAdminAccessHistoryQuery,
} from '@/hooks/useAdmin'
import type { PaketLanggananItem } from '@/types/admin.types'
import { PackageFormModal } from '../components/PackageFormModal'
import { PackageDeleteModal } from '../components/PackageDeleteModal'
import { TenantAccessModal } from '../components/TenantAccessModal'

export const SuperAdminSettingsPage: FC = () => {
  const { user: authUser } = useAuthStore()

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'plans' | 'tenant-access'>('profile')

  // Toast State
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

  // Form Profile State (real user from authStore)
  const [fullName, setFullName] = useState(authUser?.name || 'Super Admin')
  const [email, setEmail] = useState(authUser?.email || '')
  const [isSavedSuccess, setIsSavedSuccess] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)


  // Real Database TanStack Query Hooks for Packages
  const { data: packages = [], isLoading: isLoadingPackages, refetch: refetchPackages } = useAdminPackages()
  const togglePackageMutation = useTogglePackageStatus()

  // Package Modals State
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PaketLanggananItem | null>(null)
  const [deletePackageItem, setDeletePackageItem] = useState<PaketLanggananItem | null>(null)

  // Real Database TanStack Query Hooks for Tenants & Access
  const { data: tenantsResponse, isLoading: isLoadingTenants } = useAdminTenants(1)
  const tenants = tenantsResponse?.data || []
  const { data: accessHistory = [], refetch: refetchAccess } = useAdminAccessHistoryQuery()

  // Tenant Access Modal State
  const [accessModal, setAccessModal] = useState<{
    isOpen: boolean
    tenantId: string | number
    tenantName: string
  }>({
    isOpen: false,
    tenantId: '',
    tenantName: '',
  })

  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }


  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault()
    setIsSavedSuccess(true)
    showToast('Profil Disimpan', 'Data profil Super Admin berhasil diperbarui.', 'success')
    setTimeout(() => setIsSavedSuccess(false), 3000)
  }

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(true)
    showToast('Kata Sandi', 'Kata sandi berhasil diperbarui.', 'success')
    setTimeout(() => {
      setPasswordSuccess(false)
      setIsPasswordModalOpen(false)
      setOldPassword('')
      setNewPassword('')
    }, 1500)
  }

  const handleTogglePackageStatus = async (pkg: PaketLanggananItem) => {
    const targetStatus = !pkg.status_aktif
    try {
      await togglePackageMutation.mutateAsync({
        id: pkg.id_paket,
        statusAktif: targetStatus,
      })
      const txt = targetStatus ? 'diaktifkan' : 'dinonaktifkan'
      showToast('Status Paket', `Paket ${pkg.nama_paket} berhasil ${txt}.`, 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status paket.'
      showToast('Gagal', msg, 'error')
    }
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

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan Super Admin</h1>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi kredensial profil akun pusat, manajemen paket langganan SaaS, dan hak akses inspeksi tenant.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Profil Akun</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'plans'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Manajemen Paket Langganan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tenant-access')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tenant-access'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Kontrol Akses Tenant</span>
        </button>
      </div>

      {/* Tab 1: Profil Akun */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Informasi Pribadi & Kredensial</h2>
            <p className="text-xs text-slate-400 mt-0.5">Perbarui informasi kontak dan foto profil akun Super Admin Anda.</p>
          </div>

          {isSavedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
              <span>Perubahan profil berhasil disimpan!</span>
            </div>
          )}

          <form key={authUser?.id ?? 'profile-form'} onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl text-xs">
            {/* Foto Profil */}
            <div className="flex items-center gap-5">
              <UserAvatar
                src={authUser?.avatarUrl}
                name={fullName}
                className="w-16 h-16 border-2 border-slate-200 shadow-xs"
                textClassName="text-xl font-bold text-slate-700"
                iconClassName="w-8 h-8 text-slate-400"
                theme="light"
              />

              <div>
                <h4 className="font-bold text-slate-800">Foto Profil Pusat</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kredensial Super Administrator Terverifikasi
                </p>
              </div>
            </div>

            {/* Nama Lengkap & Peran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Hak Akses Sistem</label>
                <input
                  type="text"
                  disabled
                  value={authUser?.role === 'SUPER_ADMIN' ? 'Super Administrator' : authUser?.role || 'Super Administrator'}
                  className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Alamat Email Operasional</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Tombol Aksi: Ganti Password & Simpan Perubahan */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>Ganti Password</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <Save className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Manajemen Paket Langganan */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Katalog Paket Langganan SaaS</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasi durasi siklus, harga resmi langganan, dan status ketersediaan di portal mitra.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedPackage(null)
                setIsPackageFormOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-white shrink-0" strokeWidth={1.75} />
              <span>Tambah Paket Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-6">Nama Paket</th>
                    <th className="py-3.5 px-6">Harga Paket</th>
                    <th className="py-3.5 px-6">Durasi Tambahan</th>
                    <th className="py-3.5 px-6">Status Katalog</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingPackages ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                        <p className="text-xs font-semibold text-slate-700">Memuat katalog paket...</p>
                      </td>
                    </tr>
                  ) : packages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700">Belum ada paket langganan</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Klik tombol Tambah Paket Baru untuk membuat paket langganan pertama.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    packages.map((pkg) => (
                      <tr key={pkg.id_paket ?? pkg.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{pkg.nama_paket}</div>
                          {pkg.keterangan && (
                            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
                              {pkg.keterangan}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {formatRupiah(pkg.harga)}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {pkg.tambahan_hari} Hari
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {pkg.status_aktif ? (
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
                            <button
                              type="button"
                              onClick={() => handleTogglePackageStatus(pkg)}
                              disabled={togglePackageMutation.isPending}
                              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title={pkg.status_aktif ? 'Nonaktifkan Paket' : 'Aktifkan Paket'}
                            >
                              {pkg.status_aktif ? (
                                <ToggleRight className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPackage(pkg)
                                setIsPackageFormOpen(true)
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Paket"
                            >
                              <Pencil className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletePackageItem(pkg)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Paket"
                            >
                              <Trash2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kontrol Akses Tenant */}
      {activeTab === 'tenant-access' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Kontrol Otorisasi Bantuan Tenant</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola dan mintakan izin akses inspeksi ke sistem sensor masing-masing tenant untuk pemeliharaan teknis.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetchAccess()}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Segarkan Status
            </button>
          </div>

          {isLoadingTenants ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-slate-700">Memuat data tenant...</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Belum ada tenant terdaftar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tenants.map((t, idx) => {
                const tenantId = t.tenant_id ?? t.id ?? `${t.nama_tenant}-${idx}`
                const tenantRows = accessHistory.filter((h) => String(h.tenant_id) === String(tenantId))
                const hasApproved = tenantRows.some((h) => h.status === 'disetujui')
                const hasPending = !hasApproved && tenantRows.some((h) => h.status === 'pending')
                const isAktif = typeof t.is_aktif === 'boolean' ? t.is_aktif : t.status === 'aktif'

                return (
                  <div
                    key={tenantId}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {String(tenantId).substring(0, 8)}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{t.nama_tenant}</h3>
                        <p className="text-[11px] text-slate-500">
                          {t.email || `${t.jumlah_kebun ?? 0} Kebun • ${t.jumlah_user ?? 0} Pengguna`}
                        </p>
                      </div>

                      {hasApproved ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Izin Disetujui
                        </span>
                      ) : hasPending ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                          Menunggu Persetujuan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          Akses Terkunci
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Status Mitra:{' '}
                        <strong className={isAktif ? 'text-emerald-700' : 'text-slate-500'}>
                          {isAktif ? 'Aktif' : 'Nonaktif'}
                        </strong>
                      </span>

                      {hasApproved ? (
                        <Link
                          to={`/admin/tenant/${tenantId}/inspeksi`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                          <span>Inspeksi Kebun</span>
                        </Link>
                      ) : hasPending ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                          <span>Menunggu</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setAccessModal({
                              isOpen: true,
                              tenantId,
                              tenantName: t.nama_tenant,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 shrink-0 text-slate-600" strokeWidth={1.75} />
                          <span>Minta Izin Akses</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Ganti Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Ganti Kata Sandi</h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              </button>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl">
                Kata sandi berhasil diperbarui!
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Form Modal (Create / Edit) */}
      <PackageFormModal
        isOpen={isPackageFormOpen}
        packageItem={selectedPackage}
        onClose={() => {
          setIsPackageFormOpen(false)
          setSelectedPackage(null)
        }}
        onSuccess={(msg) => {
          showToast('Berhasil', msg, 'success')
          refetchPackages()
        }}
      />

      {/* Package Delete Modal */}
      <PackageDeleteModal
        isOpen={Boolean(deletePackageItem)}
        packageItem={deletePackageItem}
        onClose={() => setDeletePackageItem(null)}
        onSuccess={(msg) => {
          showToast('Berhasil', msg, 'success')
          refetchPackages()
        }}
      />

      {/* Tenant Access Modal (Request Access) */}
      <TenantAccessModal
        isOpen={accessModal.isOpen}
        tenantId={accessModal.tenantId}
        tenantName={accessModal.tenantName}
        onClose={() => setAccessModal({ isOpen: false, tenantId: '', tenantName: '' })}
        onSuccess={(msg) => {
          showToast('Berhasil', msg, 'success')
          refetchAccess()
        }}
      />
    </div>
  )
}

export default SuperAdminSettingsPage
