import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Printer } from 'lucide-react';

export interface PrintQRModalData {
  qrId: string;
  qrCodeText: string;
  nodeCode: string;
  farmName: string;
  blockName: string;
  status: boolean;
  createdAt?: string;
}

interface PrintQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: PrintQRModalData | null;
}

export const PrintQRModal: React.FC<PrintQRModalProps> = ({
  isOpen,
  onClose,
  qrData,
}) => {
  if (!qrData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pratinjau Stiker QR Sensor"
      description="Format label tahan cuaca siap cetak untuk dipasang pada tiang node sensor."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Label Pratinjau Siap Cetak */}
        <div
          id="printable-qr-sticker"
          className="bg-white border-2 border-slate-900 rounded-2xl p-6 flex flex-col items-center text-center shadow-xs"
        >
          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">
              AGROLIGHT SENSOR TAG
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                qrData.status
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {qrData.status ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>

          {/* Visual QR Code Display */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center my-2 shadow-2xs">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                qrData.qrCodeText
              )}`}
              alt={qrData.qrCodeText}
              className="w-40 h-40 object-contain"
              loading="lazy"
            />
            <span className="mt-2.5 font-mono text-xs font-bold text-slate-900 tracking-wider">
              {qrData.qrCodeText}
            </span>
          </div>

          {/* Detail Informasi Target */}
          <div className="w-full space-y-1.5 mt-4 text-left bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Node Terpasang:</span>
              <span className="font-bold text-slate-900 font-mono">{qrData.nodeCode}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Kebun:</span>
              <span className="font-semibold text-slate-800">{qrData.farmName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Blok Lahan:</span>
              <span className="font-semibold text-emerald-700">{qrData.blockName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">ID Database:</span>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[170px]">
                {qrData.qrId}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 min-h-[40px] text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Stiker QR</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
