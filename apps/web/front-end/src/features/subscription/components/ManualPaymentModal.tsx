import { useState, type FC, type ChangeEvent, type FormEvent } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, Building2, Copy, Check } from 'lucide-react';
import { petaniSubscriptionService } from '@/services/petaniSubscriptionService';
import type { PaketLanggananItem } from '@/types/petaniSubscription.types';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paket: PaketLanggananItem | null;
  onSuccess: () => void;
}

export const ManualPaymentModal: FC<ManualPaymentModalProps> = ({
  isOpen,
  onClose,
  paket,
  onSuccess,
}) => {
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

  const handleSubmit = async (e: FormEvent) => {
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
      onSuccess();
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
            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Transfer Manual
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Paket {paket.nama_paket} ({paket.tambahan_hari} Hari)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Isi Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Ringkasan Biaya */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Tagihan Transfer</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{formattedPrice}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                +{paket.tambahan_hari} Hari Aktif
              </span>
            </div>
          </div>

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

          {/* Pesan Error */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Mengirim Bukti...</span>
              ) : (
                <span>Kirim Bukti Pembayaran</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
