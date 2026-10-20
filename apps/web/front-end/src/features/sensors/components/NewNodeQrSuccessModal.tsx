import React from 'react';
import { X, CheckCircle2, Download, Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NewNodeQrSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeCode: string;
  qrCodeText: string;
  farmName?: string;
  blockName?: string;
}

export const NewNodeQrSuccessModal: React.FC<NewNodeQrSuccessModalProps> = ({
  isOpen,
  onClose,
  nodeCode,
  qrCodeText,
  farmName,
  blockName,
}) => {
  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    qrCodeText
  )}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Node Sensor Dibuat</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
            <img
              src={qrImageUrl}
              alt={qrCodeText}
              className="w-44 h-44 object-contain"
            />
          </div>

          <div>
            <span className="font-mono text-base font-bold text-slate-900">{qrCodeText}</span>
            <p className="text-xs text-slate-500 mt-0.5">
              Perangkat: {nodeCode}
              {blockName ? ` | Blok: ${blockName}` : ''}
              {farmName ? ` (${farmName})` : ''}
            </p>
          </div>

          <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 text-left space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stiker Siap Cetak</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Kode QR di atas otomatis dibuat untuk node sensor ini. Silakan cetak atau unduh untuk ditempelkan pada tiang fisik.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-2.5">
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
      </div>
    </div>
  );
};
