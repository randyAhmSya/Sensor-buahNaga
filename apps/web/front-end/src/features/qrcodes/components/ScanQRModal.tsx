import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ScanLine,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  Cpu,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { qrCodeService, type ScannedQRResult } from '@/services/qrService';

interface ScanQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScanQRModal: React.FC<ScanQRModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScannedQRResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleScanOrLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = inputCode.trim();
    if (!cleanCode) {
      setErrorMessage('Masukkan atau scan kode QR terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    setHasSearched(true);

    try {
      const data = await qrCodeService.scan({
        teks_kode_qr: cleanCode,
        platform: 'web',
      });
      if (!data) {
        setErrorMessage(`Kode QR "${cleanCode}" tidak ditemukan atau belum terhubung dengan perangkat sensor.`);
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat memproses kode QR.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputCode('');
    setResult(null);
    setErrorMessage(null);
    setHasSearched(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Scan / Cek Kode QR</h3>
              <p className="text-xs text-slate-500">Verifikasi perangkat dan blok lahan dari kode QR</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-5">
          {/* Input Form */}
          <form onSubmit={handleScanOrLookup} className="space-y-3">
            <label htmlFor="qr-input-text" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Masukkan Teks / Kode QR
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="qr-input-text"
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Contoh: AGL-5821 atau SNS-001..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 rounded-xl text-sm font-medium text-slate-900 outline-none transition-all shadow-xs"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading || !inputCode.trim()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ScanLine className="w-4 h-4" />
                    <span>Cek QR</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Inline Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-rose-600">Pastikan kode QR terdaftar dan sudah dipasangkan (pairing) pada sensor IoT.</p>
              </div>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-3 border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      QR Terverifikasi
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                      {result.kode_perangkat || result.id_sensor}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      result.status_koneksi?.toLowerCase() === 'aktif' || result.status_koneksi?.toLowerCase() === 'online'
                        ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100/80 text-rose-800 border-rose-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        result.status_koneksi?.toLowerCase() === 'aktif' || result.status_koneksi?.toLowerCase() === 'online'
                          ? 'bg-emerald-600'
                          : 'bg-rose-600'
                      }`}
                    />
                    {result.status_koneksi?.toLowerCase() === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {/* Data Detail Hirarki: Kebun -> Blok -> Sensor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Nama Kebun */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Kebun</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">
                    {result.blok?.kebun?.nama_kebun || 'Kebun Buah Naga'}
                  </p>
                  {result.blok?.kebun?.id_kebun && (
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      ID: {result.blok.kebun.id_kebun}
                    </p>
                  )}
                </div>

                {/* Nama Blok Lahan */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Blok Lahan</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">
                    {result.blok?.nama_blok || 'Blok Utama'}
                  </p>
                  {result.blok?.id_blok && (
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      ID: {result.blok.id_blok}
                    </p>
                  )}
                </div>

                {/* Tipe Sensor */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                    <Radio className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tipe Sensor</span>
                  </div>
                  <p className="font-bold text-slate-800">
                    {result.tipe_sensor || 'lux_suhu'}
                  </p>
                </div>

                {/* ID Perangkat */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <span>Primary Key Sensor</span>
                  </div>
                  <p className="font-mono font-semibold text-slate-700 truncate">
                    {result.id_sensor}
                  </p>
                </div>
              </div>

              {/* Tautan Navigasi Cepat */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    navigate('/kebun/sensors');
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  <span>Buka Halaman Monitoring Sensor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Empty Prompt State when first opened */}
          {!result && !errorMessage && !hasSearched && (
            <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ScanLine className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Pindai barcode atau ketik teks kode QR</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sistem akan mencocokkan kebun, blok lahan, dan node sensor terkait.
              </p>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          {result && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleReset}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
            >
              Scan Lainnya
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleClose}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
