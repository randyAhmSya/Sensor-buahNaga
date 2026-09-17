import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { harvestService } from '@/services/harvestService';
import type { HarvestCycle } from '../types/harvest.types';

interface DeleteHarvestCycleModalProps {
  isOpen: boolean;
  cycle: HarvestCycle | null;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

export const DeleteHarvestCycleModal: React.FC<DeleteHarvestCycleModalProps> = ({
  isOpen,
  cycle,
  onClose,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !cycle) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await harvestService.deleteHarvestCycle(cycle.id_siklus_panen);
      onSuccess(cycle.id_siklus_panen);
      onClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Gagal menghapus siklus panen.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Siklus</h3>
              <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus data siklus panen untuk{' '}
            <strong className="text-slate-900">{cycle.blockName}</strong> ({cycle.farmName})?
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Mulai Penyinaran:</span>
              <span className="font-semibold text-slate-800">{cycle.tanggal_penyinaran}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimasi Panen:</span>
              <span className="font-semibold text-slate-800">{cycle.estimasi_tanggal_panen}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-slate-800">{cycle.status_siklus}</span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 border-slate-300 text-slate-700 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Siklus'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
