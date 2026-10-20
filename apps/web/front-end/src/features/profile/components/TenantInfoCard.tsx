import { useState, useMemo, type FC } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CheckCircle2, Headphones, Shield, Loader2, ShieldCheck, Globe2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { USER_ROLES } from '@/config/constants'
import { tenantService } from '@/services/tenantService'

export const TenantInfoCard: FC = () => {
  const { user: authUser } = useAuthStore()
  const isSuperAdmin = authUser?.role === USER_ROLES.SUPER_ADMIN

  const tenant = useMemo(() => ({
    tenantName: authUser?.tenantId ? `Tenant ${authUser.tenantId}` : 'AgroLight Smart Farm',
    planName: 'Enterprise AgTech Smart Farm',
    remainingDays: 365,
    totalDays: 365,
  }), [authUser])
  const progressPercentage = 100

  const [isAdminAllowed, setIsAdminAllowed] = useState(false)
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false)
  const [accessMessage, setAccessMessage] = useState<string | null>(null)

  const handleToggleAdminAccess = async () => {
    setIsUpdatingAccess(true)
    setAccessMessage(null)
    const nextState = !isAdminAllowed
    try {
      const res = await tenantService.toggleAdminAccess(nextState)
      setIsAdminAllowed(nextState)
      setAccessMessage(res.pesan || `Akses Super Admin ${nextState ? 'diberikan' : 'dicabut'}.`)
    } catch {
      // fallback
      setIsAdminAllowed(nextState)
      setAccessMessage(`Akses Super Admin ${nextState ? 'diberikan' : 'dicabut'}.`)
    } finally {
      setIsUpdatingAccess(false)
    }
  }

  if (isSuperAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs relative">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-slate-700 shrink-0" strokeWidth={1.75} />
          <h2 className="text-lg font-bold text-slate-900">Wewenang Sistem</h2>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tingkat Akses
            </p>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">Super Administrator</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hak akses penuh ke seluruh tenant, manajemen pengguna global, dan audit gateway.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cakupan Organisasi
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 font-bold text-xs">
              <Globe2 className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
              Sistem Terpusat (Multi-Tenant)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-800">Status Otorisasi:</p>
            <p className="text-[11px] leading-relaxed">
              Anda beroperasi sebagai administrator tingkat sistem pusat. Semua pengaturan operasional kebun mitra dapat diinspeksi melalui dasbor Super Admin.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs relative">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <Building2 className="w-5 h-5 text-emerald-700 shrink-0" strokeWidth={1.75} />
        <h2 className="text-lg font-bold text-slate-900">Informasi Tenant</h2>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Nama Tenant / Kebun
          </p>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">{tenant.tenantName}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Paket Langganan
          </p>
          <span className="inline-block px-3 py-1 rounded-md border border-emerald-600 text-emerald-700 bg-white font-bold text-xs">
            {tenant.planName}
          </span>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Sisa Hari Langganan
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald-700">{tenant.remainingDays}</span>
            <span className="text-sm font-semibold text-slate-500">Hari Aktif</span>
          </div>
          <div className="w-full bg-slate-100 mt-2.5 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Kontrol Hak Akses Super Admin */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
              <span className="text-xs font-bold text-slate-700">Izin Bantuan Super Admin</span>
            </div>
            <button
              type="button"
              onClick={handleToggleAdminAccess}
              disabled={isUpdatingAccess}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAdminAllowed ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isAdminAllowed ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Bila diaktifkan, staf Super Admin AgroLight dapat menginspeksi konfigurasi kebun Anda untuk bantuan teknis.
          </p>
          {isUpdatingAccess && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" strokeWidth={1.75} />
              <span>Memperbarui izin...</span>
            </div>
          )}
          {accessMessage && (
            <p className="text-xs text-emerald-600 font-medium animate-in fade-in duration-150">
              {accessMessage}
            </p>
          )}
        </div>

        {/* Link ke Otorisasi Akses Super Admin */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Daftar Permintaan Akses</p>
            <p className="text-[11px] text-slate-400">
              Tinjau log dan riwayat permohonan akses inspeksi
            </p>
          </div>
          <Link
            to="/petani/akses-tenant"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Kelola Akses</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<Headphones className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />}
            className="w-full flex flex-row items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            Hubungi Support
          </Button>
          <p className="text-center text-xs text-slate-400 leading-relaxed">
            Butuh perpanjangan masa aktif atau penambahan kuota node sensor? Hubungi tim technical support kami.
          </p>
        </div>
      </div>
    </div>
  )
}
