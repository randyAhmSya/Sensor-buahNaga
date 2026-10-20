import { useState, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  History,
  ShieldPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  X,
  ExternalLink,
} from 'lucide-react'
import { useAdminAccessHistoryQuery } from '@/hooks/useAdmin'
import type { AdminTenantAccessItem } from '@/types/tenantAccess.types'

export const AccessRequestsPage: FC = () => {
  const navigate = useNavigate()
  const { data: requests = [], isLoading, isError, refetch } = useAdminAccessHistoryQuery()
  const [activeTab, setActiveTab] = useState<'Semua' | 'pending' | 'disetujui' | 'ditolak_dicabut'>('Semua')
  const [selectedTicket, setSelectedTicket] = useState<AdminTenantAccessItem | null>(null)

  const countMenunggu = requests.filter((r) => r.status === 'pending').length
  const countDisetujui = requests.filter((r) => r.status === 'disetujui').length
  const countDitolak = requests.filter((r) => r.status === 'ditolak').length
  const countDicabut = requests.filter((r) => r.status === 'dicabut').length

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'Semua') return true
    if (activeTab === 'pending') return r.status === 'pending'
    if (activeTab === 'disetujui') return r.status === 'disetujui'
    if (activeTab === 'ditolak_dicabut') return r.status === 'ditolak' || r.status === 'dicabut'
    return true
  })

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '-'
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Permintaan Akses & Otorisasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Riwayat dan validasi izin inspeksi teknis staf internal ke infrastruktur kebun milik tenant AgroLight.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-600 shrink-0" strokeWidth={1.75} />
            <span>Segarkan Log</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/tenants')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <ShieldPlus className="w-4 h-4 text-white shrink-0" strokeWidth={1.75} />
            <span>Minta Akses Tenant</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow h-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Menunggu Persetujuan
            </span>
            <Clock className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{countMenunggu}</span>
              <span className="text-xs font-medium text-slate-500">Pending</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Menunggu respon pengelola</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow h-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Akses Disetujui
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{countDisetujui}</span>
              <span className="text-xs font-medium text-emerald-600">Aktif</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Dapat melakukan inspeksi</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow h-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Permintaan Ditolak
            </span>
            <XCircle className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{countDitolak}</span>
              <span className="text-xs font-medium text-slate-500">Ditolak</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tidak diberi izin akses</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow h-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
              Izin Dicabut
            </span>
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{countDicabut}</span>
              <span className="text-xs font-medium text-slate-500">Ditutup</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Akses telah berakhir</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(
          [
            { key: 'Semua', label: `Semua (${requests.length})` },
            { key: 'pending', label: `Menunggu (${countMenunggu})` },
            { key: 'disetujui', label: `Disetujui (${countDisetujui})` },
            { key: 'ditolak_dicabut', label: `Ditolak / Dicabut (${countDitolak + countDicabut})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
            <p>Memuat riwayat permohonan akses...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-xs text-slate-600 space-y-3">
            <p className="font-semibold text-slate-900">Gagal memuat data riwayat akses.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Tidak ada riwayat permohonan akses</p>
            <p className="text-[11px] text-slate-400">
              Belum ada permohonan akses tenant dengan kriteria filter ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">ID & Tanggal</th>
                  <th className="py-3.5 px-6">Tenant Sasaran</th>
                  <th className="py-3.5 px-6">Alasan Permintaan</th>
                  <th className="py-3.5 px-6">Diputuskan Oleh</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((r) => {
                  const displayReason = r.alasan_permintaan ?? r.alasan ?? '-'
                  const tenantName = r.tenant?.nama_tenant || `Tenant #${r.tenant_id}`

                  return (
                    <tr key={r.id_akses || r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-mono text-[10px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded inline-block">
                            #{r.id_akses || r.id}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">{formatDate(r.diminta_pada)}</p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-900">{tenantName}</p>
                          <p className="text-[11px] text-slate-400">
                            {r.tenant?.email || `ID: ${r.tenant_id}`}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-slate-700 text-xs line-clamp-2" title={displayReason}>
                          {displayReason}
                        </p>
                        {r.alasan_penolakan && (
                          <p className="text-[11px] text-slate-500 mt-1 italic">
                            Catatan: {r.alasan_penolakan}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-600">
                        {r.diputuskan_oleh || '-'}
                        {r.diputuskan_pada && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatDate(r.diputuskan_pada)}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {r.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                            Menunggu
                          </span>
                        )}
                        {r.status === 'disetujui' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Disetujui
                          </span>
                        )}
                        {r.status === 'ditolak' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Ditolak
                          </span>
                        )}
                        {r.status === 'dicabut' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Dicabut
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {r.status === 'disetujui' && (
                            <Link
                              to={`/admin/tenant/${r.tenant_id}/inspeksi`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors"
                            >
                              <span>Inspeksi Kebun</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedTicket(r)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Detail Tiket"
                          >
                            <Info className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Tiket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
                <h3 className="text-base font-bold text-slate-900">Detail Permohonan Akses</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <p className="text-slate-400 font-semibold">Nomor Tiket:</p>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">#{selectedTicket.id_akses || selectedTicket.id}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">Waktu Pengajuan:</p>
                  <p className="font-bold text-slate-800 mt-0.5">{formatDate(selectedTicket.diminta_pada)}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-semibold">Tenant Sasaran:</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {selectedTicket.tenant?.nama_tenant || `Tenant #${selectedTicket.tenant_id}`}
                </p>
                <p className="text-slate-500">
                  {selectedTicket.tenant?.email || `ID Tenant: ${selectedTicket.tenant_id}`}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold">Status Akses:</p>
                <div className="mt-1">
                  {selectedTicket.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Menunggu Persetujuan
                    </span>
                  )}
                  {selectedTicket.status === 'disetujui' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Disetujui
                    </span>
                  )}
                  {selectedTicket.status === 'ditolak' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Ditolak
                    </span>
                  )}
                  {selectedTicket.status === 'dicabut' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Dicabut
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-semibold">Alasan Permintaan:</p>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed mt-1">
                  {selectedTicket.alasan_permintaan ?? selectedTicket.alasan ?? '-'}
                </p>
              </div>

              {selectedTicket.alasan_penolakan && (
                <div>
                  <p className="text-slate-400 font-semibold">Alasan Penolakan:</p>
                  <p className="p-3 bg-slate-100 rounded-xl text-slate-800 leading-relaxed mt-1">
                    {selectedTicket.alasan_penolakan}
                  </p>
                </div>
              )}

              {selectedTicket.diputuskan_oleh && (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <p className="text-slate-400 font-semibold">Diputuskan Oleh:</p>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedTicket.diputuskan_oleh}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold">Waktu Keputusan:</p>
                    <p className="font-bold text-slate-800 mt-0.5">{formatDate(selectedTicket.diputuskan_pada)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-slate-100">
              {selectedTicket.status === 'disetujui' ? (
                <Link
                  to={`/admin/tenant/${selectedTicket.tenant_id}/inspeksi`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
                >
                  <span>Buka Halaman Inspeksi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessRequestsPage

