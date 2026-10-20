import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { QRCodeItem } from '@/types/qr.types';

interface DeleteQRModalProps {
  isOpen: boolean;
  item: QRCodeItem | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isDeleting?: boolean;
}

export const DeleteQRModal: React.FC<DeleteQRModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !item) return null;

  const isAssigned = Boolean(
    item.isAssignedToNode ||
    (item.nodeSensorName && item.nodeSensorName.trim() !== '') ||
    item.pairingStatus === 'Sudah Terhubung'
  );

  const nodeName = item.nodeSensorName || 'Node Sensor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50 transition-colors"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <h3 className="text-lg font-bold text-slate-900">
            {isAssigned ? 'Lepas & Hapus QR Code?' : 'Hapus QR Code?'}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isAssigned ? (
              <>
                QR ini akan dilepas dari node sensor{' '}
                <span className="font-bold text-slate-900 font-mono">[{nodeName}]</span>. Node sensor tidak akan terhapus, tapi tidak akan punya QR sampai dipasangkan QR baru. Lanjutkan?
              </>
            ) : (
              <>
                Apakah Anda yakin ingin menghapus kode{' '}
                <span className="font-bold text-slate-900 font-mono">{item.codeText}</span>? Kode QR yang dihapus tidak dapat dipulihkan kembali.
              </>
            )}
          </p>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-white font-semibold cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            disabled={isDeleting}
            onClick={() => onConfirm(item.id)}
            className="w-full sm:w-auto flex flex-row items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
