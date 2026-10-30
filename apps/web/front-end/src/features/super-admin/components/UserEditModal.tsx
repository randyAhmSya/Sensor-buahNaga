import { useState, useEffect, type FC, type FormEvent } from 'react'
import { X, UserCheck, Mail, User, Lock, Building2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUpdateUser, useAdminTenants } from '@/hooks/useAdmin'
import type { AdminUserItem, UpdateUserPayload, AdminUserRole } from '@/types/admin.types'
import { ApiError } from '@/services/api'

interface UserEditModalProps {
  isOpen: boolean
  user: AdminUserItem | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export const UserEditModal: FC<UserEditModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const [namaLengkap, setNamaLengkap] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminUserRole>('petani_biasa')
  const [tenantId, setTenantId] = useState<string>('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({})

  const { data: tenantData } = useAdminTenants(1)
  const tenants = tenantData?.data || []

  const updateMutation = useUpdateUser()

  useEffect(() => {
    if (user) {
      setNamaLengkap(user.nama_lengkap || '')
      setEmail(user.email || '')
      setRole((user.role === 'superAdmin' || user.role === 'SUPER_ADMIN') ? 'superAdmin' : 'petani_biasa')
      setTenantId(user.tenant_id ? String(user.tenant_id) : '')
      setPassword('')
      setPasswordConfirmation('')
      setClientErrors({})
      setApiErrors({})
    }
  }, [user])

  if (!isOpen || !user) return null

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!namaLengkap.trim()) {
      errs.nama_lengkap = 'Nama lengkap wajib diisi.'
    }
    if (!email.trim()) {
      errs.email = 'Alamat email wajib diisi.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Format email tidak valid.'
    }
    if (password && password.length < 8) {
      errs.password = 'Kata sandi baru minimal 8 karakter.'
    }
    if (password && password !== passwordConfirmation) {
      errs.password_confirmation = 'Konfirmasi kata sandi tidak cocok.'
    }
    if (role === 'petani_biasa' && !tenantId) {
      errs.tenant_id = 'Pilih organisasi tenant untuk akun petani.'
    }

    setClientErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiErrors({})

    if (!validate()) return

    const payload: UpdateUserPayload = {
      nama_lengkap: namaLengkap.trim(),
      email: email.trim(),
      role,
      tenant_id: role === 'petani_biasa' ? tenantId : null,
    }

    if (password) {
      payload.password = password
      payload.password_confirmation = passwordConfirmation
    }

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        payload,
      })
      onSuccess(`Data akun ${namaLengkap} berhasil diperbarui.`)
      onClose()
    } catch (err: unknown) {
      if (err instanceof ApiError && err.errors) {
        setApiErrors(err.errors)
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal memperbarui profil pengguna.'
        setClientErrors((prev) => ({ ...prev, general: msg }))
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="edit-user-title" className="text-base font-bold text-slate-900">
                Edit Profil Pengguna
              </h2>
              <p className="text-xs text-slate-500">
                Perbarui informasi akun dan reset kredensial pengguna.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {clientErrors.general && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800">
              {clientErrors.general}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Peran Pengguna (Role)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('petani_biasa')}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  role === 'petani_biasa'
                    ? 'border-emerald-600 bg-emerald-50/40 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-xs font-bold block">Petani Kebun</span>
                <span className="text-[11px] text-slate-500">Akses operasional kebun</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('superAdmin')
                  setTenantId('')
                }}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  role === 'superAdmin'
                    ? 'border-emerald-600 bg-emerald-50/40 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-xs font-bold block">Super Admin</span>
                <span className="text-[11px] text-slate-500">Akses penuh sistem</span>
              </button>
            </div>
          </div>

          {/* Tenant Selector jika role petani_biasa */}
          {role === 'petani_biasa' && (
            <div>
              <label htmlFor="edit_tenant_select" className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Organisasi Tenant Mitra
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
                <select
                  id="edit_tenant_select"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Pilih tenant perkebunan...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.nama_tenant} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
              {clientErrors.tenant_id && (
                <p className="text-[11px] text-slate-600 mt-1">{clientErrors.tenant_id}</p>
              )}
            </div>
          )}

          {/* Nama Lengkap */}
          <div>
            <label htmlFor="edit_nama_lengkap" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap <span className="text-slate-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
              <input
                id="edit_nama_lengkap"
                type="text"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {clientErrors.nama_lengkap && (
              <p className="text-[11px] text-slate-600 mt-1">{clientErrors.nama_lengkap}</p>
            )}
            {apiErrors.nama_lengkap?.map((msg, i) => (
              <p key={i} className="text-[11px] text-slate-600 mt-1">{msg}</p>
            ))}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="edit_user_email" className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Email <span className="text-slate-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
              <input
                id="edit_user_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {clientErrors.email && (
              <p className="text-[11px] text-slate-600 mt-1">{clientErrors.email}</p>
            )}
            {apiErrors.email?.map((msg, i) => (
              <p key={i} className="text-[11px] text-slate-600 mt-1">{msg}</p>
            ))}
          </div>

          {/* Reset Password Opsional */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-700 mb-1">
              Ganti Kata Sandi (Kosongkan bila tidak diubah)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div>
                <label htmlFor="edit_user_password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
                  <input
                    id="edit_user_password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 karakter"
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {clientErrors.password && (
                  <p className="text-[11px] text-slate-600 mt-1">{clientErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit_user_password_confirmation" className="block text-xs font-semibold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
                  <input
                    id="edit_user_password_confirmation"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                {clientErrors.password_confirmation && (
                  <p className="text-[11px] text-slate-600 mt-1">{clientErrors.password_confirmation}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={updateMutation.isPending}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
