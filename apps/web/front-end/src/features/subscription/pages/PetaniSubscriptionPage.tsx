import { useState, type FC } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw,
  Check,
  ArrowRight,
  Zap,
  Building2,
  Loader2
} from 'lucide-react';
import { petaniSubscriptionService } from '@/services/petaniSubscriptionService';
import { petaniSubscriptionKeys, farmKeys } from '@/services/queryKeys';
import { ManualPaymentModal } from '../components/ManualPaymentModal';
import type { PaketLanggananItem, PetaniPaymentStatus } from '@/types/petaniSubscription.types';

export const PetaniSubscriptionPage: FC = () => {
  const queryClient = useQueryClient();
  const [selectedPaket, setSelectedPaket] = useState<PaketLanggananItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // 1. Query Status Langganan Tenant
  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: petaniSubscriptionKeys.status(),
    queryFn: () => petaniSubscriptionService.getStatus(),
  });

  // 2. Query Daftar Paket Aktif
  const { data: paketList = [], isLoading: isLoadingPaket } = useQuery({
    queryKey: petaniSubscriptionKeys.packages(),
    queryFn: () => petaniSubscriptionService.getPaket(),
  });

  // 3. Query Riwayat Transaksi
  const { data: riwayatData, isLoading: isLoadingRiwayat } = useQuery({
    queryKey: petaniSubscriptionKeys.riwayat(page),
    queryFn: () => petaniSubscriptionService.getRiwayat(page, 10),
  });

  const handleOpenPayment = (paket: PaketLanggananItem) => {
    setSelectedPaket(paket);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = (isOnline?: boolean) => {
    // Invalidate queries seketika
    queryClient.invalidateQueries({ queryKey: petaniSubscriptionKeys.all });
    queryClient.invalidateQueries({ queryKey: farmKeys.all });

    if (isOnline) {
      setIsCheckingStatus(true);
      // Sinkronisasi status kedua kali setelah jeda singkat untuk memastikan webhook/notifikasi backend tersimpan
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: petaniSubscriptionKeys.all });
        queryClient.invalidateQueries({ queryKey: farmKeys.all });
      }, 2500);

      // Tutup banner notifikasi setelah beberapa detik
      setTimeout(() => {
        setIsCheckingStatus(false);
      }, 7000);
    }
  };

  const statusLangganan = statusData?.status_langganan || 'trial';
  const sisaHari = statusData?.sisa_hari ?? 0;

  // Format IDR
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Normalisasi Status Transaksi (Aturan Bisnis: berhasil & diverifikasi -> Berhasil)
  const renderStatusBadge = (status: PetaniPaymentStatus | string) => {
    switch (status) {
      case 'berhasil':
      case 'diverifikasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Berhasil</span>
          </span>
        );
      case 'menunggu_pembayaran':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Pembayaran</span>
          </span>
        );
      case 'menunggu_verifikasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Verifikasi</span>
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3.5 h-3.5" />
            <span>Ditolak</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            <span className="capitalize">{status ? status.replace('_', ' ') : 'Diproses'}</span>
          </span>
        );
    }
  };

  // Badge Metode Pembayaran
  const renderPaymentMethodBadge = (metode: string | undefined | null) => {
    const isOnline =
      metode &&
      (metode.toLowerCase().includes('midtrans') ||
        metode.toLowerCase().includes('online') ||
        metode.toLowerCase().includes('otomatis') ||
        metode.toLowerCase().includes('snap') ||
        metode.toLowerCase().includes('qris') ||
        metode.toLowerCase().includes('va'));

    if (isOnline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Midtrans (Otomatis)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <Building2 className="w-3.5 h-3.5 text-slate-500" />
        <span>Transfer Manual</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>Langganan Kebun</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau status masa aktif tenant, perpanjang paket via pembayaran instan atau transfer bank, dan periksa riwayat transaksi.
          </p>
        </div>
      </div>

      {/* Banner Notifikasi: Memeriksa Status Pembayaran dari Server */}
      {isCheckingStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Memeriksa status pembayaran dari server...
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Sistem sedang memverifikasi notifikasi transaksi dari gateway Midtrans secara otomatis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: petaniSubscriptionKeys.all });
              queryClient.invalidateQueries({ queryKey: farmKeys.all });
              setIsCheckingStatus(false);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/50 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            Segarkan Sekarang
          </button>
        </div>
      )}

      {/* Kartu Status Masa Aktif Saat Ini */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Operasional Tenant
            </p>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900">
                {isLoadingStatus ? (
                  'Memuat status...'
                ) : statusLangganan === 'aktif' ? (
                  'Paket Langganan Aktif'
                ) : statusLangganan === 'trial' ? (
                  'Masa Uji Coba (Trial 7 Hari)'
                ) : statusLangganan === 'tenggang' ? (
                  'Masa Tenggang Pembayaran'
                ) : (
                  'Langganan Telah Berakhir'
                )}
              </h2>
              {!isLoadingStatus && (
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                    statusLangganan === 'aktif' || statusLangganan === 'trial'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {statusLangganan}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {statusLangganan === 'kadaluarsa'
                ? 'Akses operasional kebun dinonaktifkan sementara. Silakan pilih paket di bawah untuk mengaktifkan kembali.'
                : `Tersisa ${sisaHari} hari masa aktif sebelum perlu diperpanjang.`}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 shrink-0">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Sisa Waktu</p>
              <p className="text-2xl font-black text-slate-900">
                {isLoadingStatus ? '...' : `${sisaHari} Hari`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Katalog Paket Langganan */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Pilihan Paket Langganan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih durasi paket yang sesuai dengan kebutuhan operasional kebun Anda.
          </p>
        </div>

        {isLoadingPaket ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : paketList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
            Belum ada katalog paket yang aktif saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paketList.map((paket) => (
              <div
                key={paket.id_paket}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-500 transition-all shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">{paket.nama_paket}</h3>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      +{paket.tambahan_hari} Hari
                    </span>
                  </div>

                  <div className="mt-4 mb-3">
                    <span className="text-2xl font-black text-slate-900">
                      {formatRupiah(paket.harga)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">
                    {paket.deskripsi || 'Akses penuh seluruh fitur monitoring sensor, jadwal lampu otomatis, dan estimasi panen.'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                      <span>Monitoring Sensor & IoT Real-time</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                      <span>Jadwal Lampu Otomatis & Dimming</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                      <span>Estimasi Panen & Riwayat Scan QR</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(paket)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer"
                  >
                    <span>Pilih Paket Ini</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    Metode: Midtrans Instan atau Transfer Manual
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Riwayat Pembayaran */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Riwayat Transaksi & Pembayaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar transaksi pembayaran langganan melalui Midtrans maupun transfer bank manual.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Tanggal Pengajuan</th>
                  <th className="py-3.5 px-4">Paket Langganan</th>
                  <th className="py-3.5 px-4">Tambahan Hari</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4">Metode Pembayaran</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Catatan / Alasan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingRiwayat ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Memuat riwayat transaksi...
                    </td>
                  </tr>
                ) : !riwayatData?.items || riwayatData.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Belum ada riwayat transaksi pembayaran.
                    </td>
                  </tr>
                ) : (
                  riwayatData.items.map((trx) => {
                    const idTrx = trx.id_transaksi || trx.id || `${trx.created_at}-${trx.harga}`;
                    const tanggal = new Date(trx.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={String(idTrx)} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-800">{tanggal}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{trx.nama_paket}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">+{trx.tambahan_hari} Hari</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{formatRupiah(trx.harga)}</td>
                        <td className="py-3.5 px-4">{renderPaymentMethodBadge(trx.metode_pembayaran)}</td>
                        <td className="py-3.5 px-4">{renderStatusBadge(trx.status_pembayaran)}</td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {trx.status_pembayaran === 'ditolak' ? (
                            <span className="text-slate-700 font-medium">
                              {trx.alasan_penolakan || 'Pembayaran expire/cancel/deny'}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {trx.status_pembayaran === 'ditolak' && (
                            <button
                              type="button"
                              onClick={() => {
                                const targetPaket = paketList.find((p) => p.id_paket === trx.paket_langganan_id) || {
                                  id_paket: trx.paket_langganan_id,
                                  nama_paket: trx.nama_paket,
                                  harga: trx.harga,
                                  tambahan_hari: trx.tambahan_hari,
                                  status_aktif: true,
                                };
                                handleOpenPayment(targetPaket);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Beli Ulang</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginasi Sederhana */}
          {riwayatData?.meta && riwayatData.meta.last_page > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Halaman {riwayatData.meta.current_page} dari {riwayatData.meta.last_page}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={page >= riwayatData.meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Pembayaran Paket (Midtrans Snap & Transfer Manual) */}
      <ManualPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paket={selectedPaket}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
