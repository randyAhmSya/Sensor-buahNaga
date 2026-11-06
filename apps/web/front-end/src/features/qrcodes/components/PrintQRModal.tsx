import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Printer, AlertCircle } from 'lucide-react';

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

  const isPrintable = Boolean(
    qrData.qrCodeText &&
    qrData.qrCodeText !== 'Belum Terdaftar' &&
    qrData.qrCodeText.trim() !== ''
  );

  const handlePrint = () => {
    if (!isPrintable) return;
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
            {isPrintable ? (
              <>
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
              </>
            ) : (
              <div className="w-40 h-40 flex flex-col items-center justify-center p-3 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-100/70">
                <AlertCircle className="w-8 h-8 text-amber-600 mb-2 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Belum Terdaftar</span>
                <span className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Node ini belum memiliki kode QR di sistem. Generate QR terlebih dahulu.
                </span>
              </div>
            )}
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
            disabled={!isPrintable}
            title={!isPrintable ? 'Kode QR belum terdaftar di sistem' : 'Cetak Stiker QR'}
            className={`inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] text-xs font-semibold rounded-xl transition-all ${
              !isPrintable
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer active:scale-[0.98]'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Stiker QR</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
