import { type FC } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Users,
  CreditCard,
  Banknote,
  Cpu,
  Wifi,
  Trees,
  LayoutGrid,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Activity,
  History,
} from 'lucide-react'
import { useAdminDashboard } from '@/hooks/useAdmin'
import { formatRupiah, formatDateTime } from '@/utils/formatters'
import { Button } from '@/components/ui/Button'
import { resolveAdminName } from '@/types/admin.types'
import { useSaasMode } from '@/context/SaasContext'

export const SuperAdminDashboardPage: FC = () => {
  const { isSaasEnabled } = useSaasMode()
  const { data, isPending, isError, error, refetch, isFetching } = useAdminDashboard()

  if (isPending) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-slate-200 rounded-md animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-slate-200 rounded-xl animate-pulse" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-slate-200 rounded-xl animate-pulse" />
              </div>
              <div className="h-8 w-36 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Recent Activities Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Gagal Memuat Ringkasan Dashboard</h2>
            <p className="text-xs text-slate-500 mt-1">{error?.message || 'Terjadi gangguan saat menghubungi server.'}</p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang Data</span>
          </Button>
        </div>
      </div>
    )
  }

  const { tenant, pengguna, user, langganan, transaksi_keuangan, transaksi, infrastruktur, aktivitas_terbaru } = data

  const totalUsers = user?.total ?? pengguna?.total ?? 0
  const petaniCount = user?.per_role?.petani ?? user?.per_role?.petani_biasa ?? pengguna?.petani_biasa ?? 0
  const superAdminCount = user?.per_role?.superAdmin ?? user?.per_role?.super_admin ?? pengguna?.super_admin ?? 0

  const totalKebun = infrastruktur?.kebun?.total ?? infrastruktur?.total_kebun ?? 0
  const totalBlok = infrastruktur?.blok?.total ?? infrastruktur?.total_blok ?? 0

  const totalGw = infrastruktur?.gateway?.total ?? 0
  const gwOnline = infrastruktur?.gateway?.per_status?.online ?? infrastruktur?.gateway?.online ?? 0
  const gwOffline = infrastruktur?.gateway?.per_status?.offline ?? infrastruktur?.gateway?.offline ?? Math.max(0, totalGw - gwOnline)

  const totalNode = infrastruktur?.node_sensor?.total ?? 0
  const nodeAktif = infrastruktur?.node_sensor?.per_status?.aktif ?? infrastruktur?.node_sensor?.aktif ?? 0
  const nodeMati = infrastruktur?.node_sensor?.per_status?.nonaktif ?? infrastruktur?.node_sensor?.mati ?? Math.max(0, totalNode - nodeAktif)

  const totalTx = transaksi?.total ?? transaksi_keuangan?.total_transaksi ?? 0
  const totalIncome = transaksi?.pendapatan_total ?? transaksi_keuangan?.total_pendapatan ?? 0
  const txMenunggu = transaksi?.menunggu_pembayaran ?? transaksi_keuangan?.menunggu_pembayaran ?? 0
  const txDiverifikasi = transaksi?.diverifikasi ?? transaksi_keuangan?.diverifikasi ?? 0
  const txDitolak = transaksi?.ditolak ?? transaksi_keuangan?.ditolak ?? 0

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Ringkasan Super Admin</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring performa ekosistem platform multi-tenant, arus transaksi langganan, dan kesehatan infrastruktur IoT.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs text-slate-700 bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Perbarui Data</span>
          </Button>
          <Link
            to="/admin/tenant"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-[0.98] transition-all"
          >
            <span>Manajemen Tenant</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Tenant Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Organisasi Tenant</span>
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{tenant?.total ?? 0}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Total entitas mitra terdaftar</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Aktif: <strong className="text-slate-900">{tenant?.aktif ?? 0}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-slate-600">Nonaktif: <strong className="text-slate-900">{tenant?.nonaktif ?? 0}</strong></span>
            </div>
          </div>
        </div>

        {/* 2. Pengguna Platform Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Pengguna Terdaftar</span>
            <Users className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{totalUsers}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Akun pengguna di seluruh tenant</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-600">Petani: <strong className="text-slate-900">{petaniCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="text-slate-600">Super Admin: <strong className="text-slate-900">{superAdminCount}</strong></span>
            </div>
          </div>
        </div>

        {/* 3. Langganan Paket Card, 4. Keuangan & Pendapatan Card, 5. Transaksi Masuk Status Card */}
        {isSaasEnabled && (
          <>
            {/* 3. Langganan Paket Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Status Langganan</span>
                <CreditCard className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{langganan?.total ?? 0}</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Total portofolio paket berjalan</p>
              </div>
              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Aktif</span>
                  <strong className="text-emerald-700 font-semibold">{langganan?.aktif ?? 0}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Tenggang</span>
                  <strong className="text-slate-700 font-semibold">{langganan?.tenggang ?? 0}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Kadaluarsa</span>
                  <strong className="text-slate-500 font-semibold">{langganan?.kadaluarsa ?? 0}</strong>
                </div>
              </div>
            </div>

            {/* 4. Keuangan & Pendapatan Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Total Pendapatan</span>
                <Banknote className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {formatRupiah(totalIncome)}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Akumulasi pembayaran yang telah diverifikasi
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Total Transaksi: <strong className="text-slate-900">{totalTx}</strong>
                </span>
                <Link to="/admin/langganan" className="text-xs text-emerald-600 font-semibold hover:underline">
                  Kelola &rarr;
                </Link>
              </div>
            </div>

            {/* 5. Transaksi Masuk Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Arus Transaksi</span>
                <Activity className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 block">Menunggu</span>
                  <span className="text-base font-bold text-slate-800 mt-0.5 block">
                    {txMenunggu}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 block">Diverifikasi</span>
                  <span className="text-base font-bold text-slate-800 mt-0.5 block">
                    {txDiverifikasi}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] font-semibold text-slate-500 block">Ditolak</span>
                  <span className="text-base font-bold text-slate-700 mt-0.5 block">
                    {txDitolak}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                Perlu tindakan segera pada transaksi menunggu verifikasi.
              </p>
            </div>
          </>
        )}

        {/* 6. Infrastruktur IoT Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Infrastruktur Lapangan</span>
            <Cpu className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Trees className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              <div>
                <span className="text-slate-500 text-[10px] block">Total Kebun</span>
                <strong className="text-slate-900">{totalKebun}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              <div>
                <span className="text-slate-500 text-[10px] block">Total Blok</span>
                <strong className="text-slate-900">{totalBlok}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              <div>
                <span className="text-slate-500 text-[10px] block">Gateway</span>
                <span className="text-slate-700">
                  <strong className="text-emerald-600">{gwOnline}</strong> / {gwOffline} off
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              <div>
                <span className="text-slate-500 text-[10px] block">Node Sensor</span>
                <span className="text-slate-700">
                  <strong className="text-emerald-600">{nodeAktif}</strong> / {nodeMati} mati
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            Status agregat perangkat gateway dan node sensor nirkabel.
          </p>
        </div>
      </div>

      {/* 10 Aktivitas Admin Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
            <h2 className="text-sm font-bold text-slate-900">10 Aktivitas Admin Terbaru</h2>
          </div>
          <Link
            to="/admin/log-aktivitas"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Lihat Seluruh Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </Link>
        </div>

        {(!aktivitas_terbaru || aktivitas_terbaru.length === 0) ? (
          <div className="py-12 px-4 text-center">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" strokeWidth={1.75} />
            <p className="text-xs font-semibold text-slate-700">Belum ada aktivitas admin yang tercatat</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Setiap perubahan konfigurasi atau otorisasi akan tercatat di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Waktu</th>
                  <th className="py-3 px-4 font-semibold">Admin</th>
                  <th className="py-3 px-4 font-semibold">Aksi</th>
                  <th className="py-3 px-4 font-semibold">Target</th>
                  <th className="py-3 px-4 font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aktivitas_terbaru.map((log, idx) => {
                  const rawTime = log.waktu ?? log.created_at
                  return (
                    <tr key={log.id_log || log.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {rawTime ? formatDateTime(rawTime) : '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {resolveAdminName(log)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                          {log.aksi}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {log.target_tipe} #{log.target_id}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {log.keterangan}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuperAdminDashboardPage
