import { useMemo, type FC } from 'react'
import { Building2, CheckCircle2, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getTenantInfo } from '@/data/mockUser'

export const TenantInfoCard: FC = () => {
  const tenant = useMemo(() => getTenantInfo(), [])
  const progressPercentage = Math.round((tenant.remainingDays / tenant.totalDays) * 100)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs relative">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <Building2 className="w-5 h-5 text-emerald-700" />
        <h2 className="text-lg font-bold text-slate-900">Informasi Tenant</h2>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Nama Tenant / Kebun
          </p>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">{tenant.tenantName}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
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

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<Headphones className="w-4 h-4 text-slate-500 shrink-0" />}
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
