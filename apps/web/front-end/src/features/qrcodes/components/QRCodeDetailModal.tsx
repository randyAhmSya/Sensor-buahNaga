import React from 'react';
import { X, Download, Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { QRCodeItem } from '@/types/qr.types';

interface QRCodeDetailModalProps {
  isOpen: boolean;
  item: QRCodeItem | null;
  onClose: () => void;
}

export const QRCodeDetailModal: React.FC<QRCodeDetailModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Detail QR Code Blok</h3>
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
              src={item.qrImageUrl}
              alt={item.codeText}
              className="w-48 h-48 object-contain"
            />
          </div>

          <div>
            <span className="font-mono text-base font-bold text-slate-900">{item.codeText}</span>
            <p className="text-xs text-slate-500 mt-0.5">{item.farmName} - {item.blockName}</p>
          </div>

          <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-600 space-y-1 text-left">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-emerald-700">{item.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Pairing IoT:</span>
              <span className="font-semibold text-slate-800">{item.pairingStatus}</span>
            </div>
            <div className="flex justify-between">
              <span>Dibuat:</span>
              <span className="text-slate-600">{item.createdAt}</span>
            </div>
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
            <span>Cetak</span>
          </Button>
          <a
            href={item.qrImageUrl}
            download={`${item.codeText}.png`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Unduh</span>
          </a>
        </div>
      </div>
    </div>
  );
};
