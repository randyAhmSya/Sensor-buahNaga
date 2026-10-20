import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Download, Printer, RefreshCw, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRegenerateNodeQrMutation } from '@/hooks/queries/useSensorsQuery';
import type { NodeSensorBackend } from '@/types/node.types';

interface RegenerateQrConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensorId: string;
  nodeCode: string;
}

export const RegenerateQrConfirmModal: React.FC<RegenerateQrConfirmModalProps> = ({
  isOpen,
  onClose,
  sensorId,
  nodeCode,
}) => {
  const [successData, setSuccessData] = useState<NodeSensorBackend | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const regenerateMutation = useRegenerateNodeQrMutation();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setErrorMessage(null);
    try {
      const res = await regenerateMutation.mutateAsync(sensorId);
      if (res && res.data) {
        setSuccessData(res.data);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'pesan' in err
          ? (err as { pesan: string }).pesan
          : 'Gagal membuat ulang kode QR. Silakan coba lagi.';
      setErrorMessage(msg);
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setErrorMessage(null);
    onClose();
  };

  const qrCodeText = successData?.qr?.teks_kode_qr;
  const qrImageUrl = qrCodeText
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeText)}`
    : '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {successData ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <RefreshCw className="w-5 h-5 text-slate-700" />
            )}
            <h3 className="text-base font-bold text-slate-900">
              {successData ? 'Kode QR Baru Siap' : 'Buat Ulang Kode QR'}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successData && qrCodeText ? (
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
              <img src={qrImageUrl} alt={qrCodeText} className="w-44 h-44 object-contain" />
            </div>

            <div>
              <span className="font-mono text-base font-bold text-slate-900">{qrCodeText}</span>
              <p className="text-xs text-slate-500 mt-0.5">Perangkat: {nodeCode}</p>
            </div>

            <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>QR Lama Dinonaktifkan</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Kode QR lama telah digantikan secara permanen. Segera cetak dan ganti stiker fisik pada tiang perangkat {nodeCode}.
              </p>
            </div>

            <div className="w-full pt-2 flex flex-col gap-2">
              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handlePrint}
                  className="flex-1 flex flex-row items-center justify-center gap-2 border-slate-300 text-slate-700 font-semibold"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>Cetak QR</span>
                </Button>
                <a
                  href={qrImageUrl}
                  download={`${qrCodeText}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex flex-row items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-xs"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Unduh QR</span>
                </a>
              </div>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleClose}
                className="w-full border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Selesai
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
              <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-900">Perhatian Sebelum Melanjutkan</p>
                <p className="text-slate-600 leading-relaxed">
                  Membuat ulang kode QR akan menghapus kode QR lama untuk node <span className="font-mono font-semibold text-slate-900">{nodeCode}</span> secara permanen dari server. Stiker fisik lama yang sudah ditempel tidak akan dapat dipindai lagi.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleClose}
                disabled={regenerateMutation.isPending}
                className="border-slate-300 text-slate-700"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="md"
                onClick={handleConfirm}
                disabled={regenerateMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {regenerateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </span>
                ) : (
                  'Ya, Buat Kode QR Baru'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
