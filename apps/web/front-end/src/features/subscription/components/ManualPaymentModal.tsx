import { useState, type FC, type ChangeEvent, type FormEvent } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Building2,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { petaniSubscriptionService } from '@/services/petaniSubscriptionService';
import type { PaketLanggananItem } from '@/types/petaniSubscription.types';
import '@/types/midtrans.d';

export type PaymentMethodType = 'midtrans' | 'manual';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paket: PaketLanggananItem | null;
  onSuccess: (isOnline?: boolean) => void;
}

/**
 * Pemuat dinamis script Midtrans Snap jika belum tersedia pada window
 */
const loadMidtransSnapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.snap) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('midtrans-snap-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Gagal memuat sistem Midtrans Snap'))
      );
      return;
    }

    const script = document.createElement('script');
    script.id = 'midtrans-snap-script';
    const snapUrl =
      import.meta.env.VITE_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';

    script.src = snapUrl;
    if (clientKey) {
      script.setAttribute('data-client-key', clientKey);
    }
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error('Gagal memuat sistem pembayaran Midtrans. Periksa koneksi internet Anda.')
      );

    document.body.appendChild(script);
  });
};

export const ManualPaymentModal: FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paket,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('midtrans');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  if (!isOpen || !paket) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 2 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal adalah 2 MB');
      return;
    }

    setErrorMessage(null);
    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  // Handler Pembayaran Otomatis via Midtrans Snap
  const handleMidtransPayment = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // 1. Dapatkan snap_token dari backend
      const res = await petaniSubscriptionService.ajukanPembelianOnline({
        paket_langganan_id: paket.id_paket,
      });

      if (!res?.snap_token) {
        throw new Error('Gagal menerima token pembayaran dari server.');
      }

      // 2. Muat script Snap jika belum ada di window
      await loadMidtransSnapScript();

      if (!window.snap) {
        throw new Error('Sistem pembayaran Midtrans Snap tidak dapat diinisialisasi.');
      }

      // 3. Panggil popup Midtrans Snap
      window.snap.pay(res.snap_token, {
        onSuccess: () => {
          onSuccess(true);
          onClose();
        },
        onPending: () => {
          onSuccess(true);
          onClose();
        },
        onError: () => {
          setErrorMessage('Terjadi kendala pada proses pembayaran.');
          onSuccess(true);
        },
        onClose: () => {
          // Ketika popup ditutup, jangan anggap popup sebagai konfirmasi final.
          // Trigger refetch data server dan tutup modal.
          onSuccess(true);
          onClose();
        },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal memulai transaksi online.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Submit Form Transfer Manual
  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Silakan pilih file bukti transfer terlebih dahulu');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await petaniSubscriptionService.ajukanPembelian({
        paket_langganan_id: paket.id_paket,
        bukti_transfer: file,
      });
      onSuccess(false);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim bukti transfer';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(paket.harga);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Pilih Pembayaran Langganan</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paket {paket.nama_paket} (+{paket.tambahan_hari} Hari Masa Aktif)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Isi Modal Form */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Ringkasan Biaya */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-300 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Tagihan Paket</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{formattedPrice}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                +{paket.tambahan_hari} Hari Aktif
              </span>
            </div>
          </div>

          {/* Pemilihan Jalur Metode Pembayaran (Radio Cards) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Metode Pembayaran
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Opsi A: Pembayaran Instan (Midtrans) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('midtrans');
                  setErrorMessage(null);
                }}
                className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedMethod === 'midtrans'
                    ? 'border-2 border-emerald-600 bg-white shadow-xs'
                    : 'border border-slate-300 bg-white hover:border-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selectedMethod === 'midtrans'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {selectedMethod === 'midtrans' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      Pembayaran Instan & Otomatis
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Rekomendasi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    QRIS, GoPay, ShopeePay, Virtual Account (BCA, Mandiri, BRI, BNI). Verifikasi
                    otomatis dalam hitungan detik tanpa upload bukti.
                  </p>
                </div>
              </button>

              {/* Opsi B: Transfer Manual */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('manual');
                  setErrorMessage(null);
                }}
                className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedMethod === 'manual'
                    ? 'border-2 border-emerald-600 bg-white shadow-xs'
                    : 'border border-slate-300 bg-white hover:border-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selectedMethod === 'manual'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {selectedMethod === 'manual' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">Transfer Bank Manual</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Transfer ke rekening PT Agro Light Sensor Indonesia dan unggah bukti transfer.
                    Menunggu verifikasi admin.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Konten Opsi A: Midtrans Snap */}
          {selectedMethod === 'midtrans' && (
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">Sistem Pembayaran Terproteksi</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Jendela pembayaran Midtrans Snap akan terbuka. Anda dapat memilih metode QRIS
                    atau Virtual Account pilihan Anda dengan konfirmasi otomatis langsung dari bank.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Konten Opsi B: Transfer Manual */}
          {selectedMethod === 'manual' && (
            <form id="form-manual-transfer" onSubmit={handleManualSubmit} className="space-y-4">
              {/* Rekening Tujuan Transfer */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Rekening Bank Tujuan
                </label>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
                      <span className="text-xs font-bold text-slate-900">Bank Central Asia (BCA)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('8290123456', 'BCA')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      {copiedAccount === 'BCA' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-800">8290 1234 56</p>
                  <p className="text-[11px] text-slate-500">a.n. PT Agro Light Sensor Indonesia</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
                      <span className="text-xs font-bold text-slate-900">Bank Mandiri</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('1370012345678', 'Mandiri')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      {copiedAccount === 'Mandiri' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-800">137 00 1234567 8</p>
                  <p className="text-[11px] text-slate-500">a.n. PT Agro Light Sensor Indonesia</p>
                </div>
              </div>

              {/* Upload Bukti Transfer */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Unggah Bukti Pembayaran
                </label>

                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors">
                  <input
                    type="file"
                    id="bukti-transfer-input"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="bukti-transfer-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    {filePreview ? (
                      <div className="space-y-2">
                        <img
                          src={filePreview}
                          alt="Pratinjau Bukti Transfer"
                          className="max-h-36 mx-auto rounded-lg object-contain border border-slate-200"
                        />
                        <p className="text-xs text-slate-600 font-medium">{file?.name}</p>
                        <span className="text-[11px] text-emerald-600 underline font-semibold">
                          Ganti File
                        </span>
                      </div>
                    ) : file ? (
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span className="text-xs font-bold">{file.name}</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <UploadCloud className="w-5 h-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Klik untuk memilih file bukti transfer
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Format JPG, PNG, atau PDF (Maksimal 2 MB)
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </form>
          )}

          {/* Pesan Error */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tombol Aksi Bawah */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            {selectedMethod === 'midtrans' ? (
              <button
                type="button"
                onClick={handleMidtransPayment}
                disabled={isSubmitting}
                className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Transaksi...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Bayar Otomatis Sekarang ({formattedPrice})</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                form="form-manual-transfer"
                disabled={isSubmitting || !file}
                className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim Bukti...</span>
                  </>
                ) : (
                  <span>Kirim Bukti Pembayaran</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PaymentModal = ManualPaymentModal;
