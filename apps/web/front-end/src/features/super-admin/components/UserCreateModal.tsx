import { useState, type FC, type FormEvent } from 'react'
import { X, UserPlus, Eye, EyeOff, Building2, Shield, Mail, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateUser, useAdminTenants } from '@/hooks/useAdmin'
import type { CreateUserPayload, AdminUserRole } from '@/types/admin.types'
import { ApiError } from '@/services/api'

interface UserCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

export const UserCreateModal: FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [namaLengkap, setNamaLengkap] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState<AdminUserRole>('petani_biasa')
  const [tenantId, setTenantId] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({})

  const { data: tenantData } = useAdminTenants(1)
  const tenants = tenantData?.data || []

  const createUserMutation = useCreateUser()

  if (!isOpen) return null

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
    if (!password) {
      errs.password = 'Kata sandi wajib diisi.'
    } else if (password.length < 8) {
      errs.password = 'Kata sandi minimal 8 karakter.'
    }
    if (password !== passwordConfirmation) {
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

    const payload: CreateUserPayload = {
      nama_lengkap: namaLengkap.trim(),
      email: email.trim(),
      password,
      password_confirmation: passwordConfirmation,
      role,
      ...(role === 'petani_biasa' && tenantId ? { tenant_id: tenantId } : {}),
    }

    try {
      await createUserMutation.mutateAsync(payload)
      onSuccess(`Akun pengguna ${namaLengkap} berhasil dibuat.`)
      handleClose()
    } catch (err: unknown) {
      if (err instanceof ApiError && err.errors) {
        setApiErrors(err.errors)
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal membuat pengguna baru.'
        setClientErrors((prev) => ({ ...prev, general: msg }))
      }
    }
  }

  const handleClose = () => {
    setNamaLengkap('')
    setEmail('')
    setPassword('')
    setPasswordConfirmation('')
    setRole('petani_biasa')
    setTenantId('')
    setShowPassword(false)
    setClientErrors({})
    setApiErrors({})
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-user-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 id="create-user-title" className="text-base font-bold text-slate-900">
                Tambah Akun Pengguna
              </h2>
              <p className="text-xs text-slate-500">
                Buat kredensial akun baru untuk petani mitra atau super admin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
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

          {/* Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Peran Pengguna (Role)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('petani_biasa')
                  setClientErrors((prev) => {
                    const next = { ...prev }
                    delete next.tenant_id
                    return next
                  })
                }}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  role === 'petani_biasa'
                    ? 'border-emerald-600 bg-slate-50 text-slate-900 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User
                    className={`w-4 h-4 shrink-0 ${
                      role === 'petani_biasa' ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                    strokeWidth={1.75}
                  />
                  <span className="text-xs font-bold">Petani Kebun</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akun pengelola operasional perkebunan tenant.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('superAdmin')
                  setTenantId('')
                  setClientErrors((prev) => {
                    const next = { ...prev }
                    delete next.tenant_id
                    return next
                  })
                }}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  role === 'superAdmin'
                    ? 'border-emerald-600 bg-slate-50 text-slate-900 ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield
                    className={`w-4 h-4 shrink-0 ${
                      role === 'superAdmin' ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                    strokeWidth={1.75}
                  />
                  <span className="text-xs font-bold">Super Admin</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Hak akses kontrol penuh terhadap seluruh sistem.
                </p>
              </button>
            </div>
          </div>

          {/* Tenant Selector jika role petani_biasa */}
          {role === 'petani_biasa' && (
            <div>
              <label htmlFor="tenant_select" className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Organisasi Tenant Mitra <span className="text-slate-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
                <select
                  id="tenant_select"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Pilih tenant perkebunan...</option>
                  {tenants.map((t) => {
                    const tId = t.tenant_id ?? t.id
                    return (
                      <option key={String(tId)} value={String(tId)}>
                        {t.email ? `${t.nama_tenant} (${t.email})` : t.nama_tenant}
                      </option>
                    )
                  })}
                </select>
              </div>
              {clientErrors.tenant_id && (
                <p className="text-[11px] text-slate-600 mt-1">{clientErrors.tenant_id}</p>
              )}
              {apiErrors.tenant_id?.map((msg, i) => (
                <p key={i} className="text-[11px] text-slate-600 mt-1">{msg}</p>
              ))}
            </div>
          )}

          {/* Nama Lengkap */}
          <div>
            <label htmlFor="nama_lengkap" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap <span className="text-slate-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
              <input
                id="nama_lengkap"
                type="text"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Contoh: Budi Hartono"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
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
            <label htmlFor="user_email" className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Email <span className="text-slate-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
              <input
                id="user_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@agrolight.id"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {clientErrors.email && (
              <p className="text-[11px] text-slate-600 mt-1">{clientErrors.email}</p>
            )}
            {apiErrors.email?.map((msg, i) => (
              <p key={i} className="text-[11px] text-slate-600 mt-1">{msg}</p>
            ))}
          </div>

          {/* Password & Konfirmasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="user_password" className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi <span className="text-slate-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
                <input
                  id="user_password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 karakter"
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
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
              {apiErrors.password?.map((msg, i) => (
                <p key={i} className="text-[11px] text-slate-600 mt-1">{msg}</p>
              ))}
            </div>

            <div>
              <label htmlFor="user_password_confirmation" className="block text-xs font-semibold text-slate-700 mb-1">
                Ulangi Kata Sandi <span className="text-slate-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" strokeWidth={1.75} />
                <input
                  id="user_password_confirmation"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              {clientErrors.password_confirmation && (
                <p className="text-[11px] text-slate-600 mt-1">{clientErrors.password_confirmation}</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={createUserMutation.isPending}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={createUserMutation.isPending}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {createUserMutation.isPending ? 'Menyimpan...' : 'Simpan Akun'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
